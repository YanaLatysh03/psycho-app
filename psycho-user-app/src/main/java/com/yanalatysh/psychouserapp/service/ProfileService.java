package com.yanalatysh.psychouserapp.service;

import com.yanalatysh.psychouserapp.dto.*;
import com.yanalatysh.psychouserapp.entity.*;
import com.yanalatysh.psychouserapp.mapper.ProfileMapper;
import com.yanalatysh.psychouserapp.repository.ProfileRepository;
import com.yanalatysh.psychouserapp.repository.UserRepository;
import lombok.Data;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
@Data
public class ProfileService {

    private final UserRepository userRepository;
    private final ProfileMapper profileMapper;
    private final ProfileRepository profileRepository;

    public ProfileResponseDTO getProfile(Long userId) {
        var profile = profileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User with profile not found with id: " + userId));

        return profileMapper.fromProfileToProfileResponseDTO(profile);
    }

    public ProfileResponseDTO createProfile(Long userId, CreateProfileRequestDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (user.getProfile() != null) {
            throw new RuntimeException("Profile already exists for user with id: " + userId);
        }

        var name = request.getName() != null
                ? request.getName().toLowerCase(Locale.ROOT)
                : null;

        var city = request.getCity() != null
                ? request.getCity().toLowerCase(Locale.ROOT)
                : null;

        Profile profile = Profile.builder()
                .name(name)
                .city(city)
                .gender(request.getGender())
                .phone(request.getPhone())
                .birthday(request.getBirthday())
                .user(user)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .isDeleted(false)
                .build();

        // Создаем метаданные в зависимости от роли
        if (user.getRole() == Role.SPECIALIST && request.getSpecialistMetaData() != null) {
            SpecialistMetaData specialistMetaData = createSpecialistMetaData(
                    request.getSpecialistMetaData(),
                    profile
            );
            profile.setSpecialistMetaData(specialistMetaData);

        } else if (user.getRole() == Role.USER && request.getUserMetaData() != null) {
            UserMetaData userMetaData = createUserMetaData(
                    request.getUserMetaData(),
                    profile
            );
            profile.setUserMetaData(userMetaData);
        }

        user.setProfile(profile);
        var savedUser = userRepository.save(user);

        return profileMapper.fromProfileToProfileResponseDTO(savedUser.getProfile());
    }

    public ProfileResponseDTO updateProfile(Long userId, UpdateProfileRequestDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Profile profile = user.getProfile();
        if (profile == null) {
            throw new RuntimeException("Profile not found for user with id: " + userId);
        }

        if (request.getName() != null) {
            profile.setName(request.getName().toLowerCase());
        }
        if (request.getGender() != null) {
            profile.setGender(request.getGender());
        }
        if (request.getCity() != null) {
            profile.setCity(request.getCity().toLowerCase());
        }
        if (request.getPhone() != null) {
            profile.setPhone(request.getPhone());
        }
        if (request.getBirthday() != null) {
            profile.setBirthday(request.getBirthday());
        }

        if (user.getRole() == Role.SPECIALIST && request.getSpecialistMetaData() != null) {
            updateSpecialistMetaData(
                    request.getSpecialistMetaData(),
                    profile
            );

        } else if (user.getRole() == Role.USER && request.getUserMetaData() != null) {
           updateUserMetaData(
                    request.getUserMetaData(),
                    profile
            );
        }

        profile.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        return profileMapper.fromProfileToProfileResponseDTO(profile);
    }

    /**
     * Поиск пользователей (USER) для специалиста
     */
    public List<ProfileResponseDTO> searchUsers(UserSearchCriteriaDTO criteria) {
        Pageable pageable = createPageable(criteria.getPage(), criteria.getSize(),
                criteria.getSortBy(), criteria.getSortDirection());


        // Нахождение максимальной и минимальной даты рождения
        LocalDate maxBirthDate = null;
        LocalDate minBirthDate = null;

        if (criteria.getAgeFrom() != null) {
            maxBirthDate = LocalDate.now().minusYears(criteria.getAgeFrom());
        }

        if (criteria.getAgeTo() != null) {
            minBirthDate = LocalDate.now().minusYears(criteria.getAgeTo() + 1).plusDays(1);
        }

        var city = criteria.getCity() != null
                ? criteria.getCity().toLowerCase(Locale.ROOT)
                : null;

        var name = criteria.getName() != null
                ? "%" + criteria.getName().toLowerCase(Locale.ROOT) + ("%")
                : null;

        // Основной поиск
        Page<Profile> profiles = profileRepository.searchUsers(
                name,
                criteria.getGender(),
                maxBirthDate,
                minBirthDate,
                city,
                pageable
        );

        // Если есть критерии по коллекциям, применяем дополнительный фильтр
        if (hasCollectionCriteria(criteria)) {
            profiles = profileRepository.searchUsersByCollections(
                    criteria.getProblemAreas(),
                    pageable
            );
        }

        if (profiles.isEmpty()) {
            return List.of();
        }

        return profiles.map(
                        profileMapper::fromProfileToProfileResponseDTO)
                .stream().toList();
    }

    /**
     * Поиск специалистов (SPECIALIST) для пользователя
     */
    public List<ProfileResponseDTO> searchSpecialists(SpecialistSearchCriteriaDTO criteria) {
        Pageable pageable = createPageable(criteria.getPage(), criteria.getSize(),
                criteria.getSortBy(), criteria.getSortDirection());

        // Нахождение максимальной и минимальной даты рождения
        LocalDate maxBirthDate = null;
        LocalDate minBirthDate = null;

        if (criteria.getAgeFrom() != null) {
            maxBirthDate = LocalDate.now().minusYears(criteria.getAgeFrom());
        }

        if (criteria.getAgeTo() != null) {
            minBirthDate = LocalDate.now().minusYears(criteria.getAgeTo() + 1).plusDays(1);
        }

        var city = criteria.getCity() != null
                ? criteria.getCity().toLowerCase(Locale.ROOT)
                : null;

        var name = criteria.getName() != null
                ? "%" + criteria.getName().toLowerCase(Locale.ROOT) + ("%")
                : null;

        // Основной поиск
        Page<Profile> profiles = profileRepository.searchSpecialists(
                name,
                criteria.getGender(),
                maxBirthDate,
                minBirthDate,
                criteria.getMinYearsOfExperience(),
                criteria.getPriceFrom(),
                criteria.getPriceTo(),
                criteria.getProvidesFreeConsultation(),
                city,
                criteria.getMinRating(),
                pageable
        );

        // Если есть критерии по коллекциям, применяем дополнительный фильтр
        if (hasCollectionCriteria(criteria)) {
            profiles = profileRepository.searchSpecialistsByCollections(
                    criteria.getApproaches(),
                    criteria.getProblemAreas(),
                    criteria.getWorkFormats(),
                    criteria.getTargetAudiences(),
                    pageable
            );
        }

        if (profiles.isEmpty()) {
            return List.of();
        }

        return profiles.map(
                        profileMapper::fromProfileToProfileResponseDTO)
                .stream().toList();
    }

    /**
     * Проверка наличия критериев по коллекциям для специалистов
     */
    private boolean hasCollectionCriteria(SpecialistSearchCriteriaDTO criteria) {
        return (criteria.getApproaches() != null && !criteria.getApproaches().isEmpty()) ||
                (criteria.getProblemAreas() != null && !criteria.getProblemAreas().isEmpty()) ||
                (criteria.getWorkFormats() != null && !criteria.getWorkFormats().isEmpty()) ||
                (criteria.getTargetAudiences() != null && !criteria.getTargetAudiences().isEmpty());
    }

    /**
     * Проверка наличия критериев по коллекциям для пользователей
     */
    private boolean hasCollectionCriteria(UserSearchCriteriaDTO criteria) {
        return (criteria.getProblemAreas() != null && !criteria.getProblemAreas().isEmpty());
    }

    /**
     * Создание Pageable с сортировкой
     */
    private Pageable createPageable(Integer page, Integer size, String sortBy, String sortDirection) {
        Sort sort = Sort.by(
                sortDirection.equalsIgnoreCase("ASC")
                        ? Sort.Direction.ASC
                        : Sort.Direction.DESC,
                sortBy
        );

        return PageRequest.of(page, size, sort);
    }

    private SpecialistMetaData createSpecialistMetaData(
            CreateSpecialistMetaDataDTO dto,
            Profile profile) {

        return SpecialistMetaData.builder()
                .id(profile.getId())
                .profile(profile)
                .education(dto.getEducation())
                .specialization(dto.getSpecialization())
                .yearsOfExperience(dto.getYearsOfExperience())
                .approaches(dto.getApproaches())
                .problemAreas(dto.getProblemAreas())
                .workFormats(dto.getWorkFormats())
                .targetAudiences(dto.getTargetAudiences())
                .sessionPrice(dto.getSessionPrice())
                .sessionDuration(dto.getSessionDuration())
                .providesFreeConsultation(dto.getProvidesFreeConsultation())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    private UserMetaData createUserMetaData(
            CreateUserMetaDataDTO dto,
            Profile profile) {

        return UserMetaData.builder()
                .id(profile.getId())
                .profile(profile)
                .problemAreas(dto.getProblemAreas())
                .therapyGoals(dto.getTherapyGoals())
                .currentSituation(dto.getCurrentSituation())
                .inCrisis(dto.getInCrisis())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    private void updateUserMetaData(
            CreateUserMetaDataDTO dto,
            Profile profile)
    {
        if (dto.getProblemAreas() != null) {
            profile.getUserMetaData().setProblemAreas(dto.getProblemAreas());
        }
        if (dto.getTherapyGoals() != null) {
            profile.getUserMetaData().setTherapyGoals(dto.getTherapyGoals());
        }
        if (dto.getCurrentSituation() != null) {
            profile.getUserMetaData().setCurrentSituation(dto.getCurrentSituation());
        }
        if (dto.getInCrisis() != null) {
            profile.getUserMetaData().setInCrisis(dto.getInCrisis());
        }
    }

    private void updateSpecialistMetaData(
            CreateSpecialistMetaDataDTO dto,
            Profile profile
    )
    {
        if (dto.getEducation() != null) {
            profile.getSpecialistMetaData().setEducation(dto.getEducation());
        }
        if (dto.getSpecialization() != null) {
            profile.getSpecialistMetaData().setSpecialization(dto.getSpecialization());
        }
        if (dto.getYearsOfExperience() != null) {
            profile.getSpecialistMetaData().setYearsOfExperience(dto.getYearsOfExperience());
        }
        if (dto.getProblemAreas() != null) {
            profile.getSpecialistMetaData().setProblemAreas(dto.getProblemAreas());
        }
        if (dto.getApproaches() != null) {
            profile.getSpecialistMetaData().setApproaches(dto.getApproaches());
        }
        if (dto.getWorkFormats() != null) {
            profile.getSpecialistMetaData().setWorkFormats(dto.getWorkFormats());
        }
        if (dto.getTargetAudiences() != null) {
            profile.getSpecialistMetaData().setTargetAudiences(dto.getTargetAudiences());
        }
        if (dto.getSessionDuration() != null) {
            profile.getSpecialistMetaData().setSessionDuration(dto.getSessionDuration());
        }
        if (dto.getSessionPrice() != null) {
            profile.getSpecialistMetaData().setSessionPrice(dto.getSessionPrice());
        }
        if (dto.getProvidesFreeConsultation() != null) {
            profile.getSpecialistMetaData().setProvidesFreeConsultation(dto.getProvidesFreeConsultation());
        }

    }

}
