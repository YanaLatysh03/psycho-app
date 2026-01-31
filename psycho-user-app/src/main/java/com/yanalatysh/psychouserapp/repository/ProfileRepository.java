package com.yanalatysh.psychouserapp.repository;

import com.yanalatysh.psychouserapp.entity.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Set;

public interface ProfileRepository extends JpaRepository<Profile, Long> {
    @Query("""
            SELECT p FROM Profile p
            JOIN p.user u
            WHERE u.role = :role
            AND p.isDeleted = false
            AND (:name IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%')))
            AND (:gender IS NULL OR p.gender = :gender)
            AND (:maxBirthDate IS NULL OR p.birthday <= :maxBirthDate)
            AND (:minBirthDate IS NULL OR p.birthday >= :minBirthDate)
            """)
    Page<Profile> searchByRole(
            @Param("role") String role,
            @Param("name") String name,
            @Param("gender") String gender,
            @Param("maxBirthDate") LocalDate maxBirthDate,
            @Param("minBirthDate") LocalDate minBirthDate,
            Pageable pageable
    );

    /**
     * Поиск специалистов для пользователей
     */
    @Query("""
        SELECT DISTINCT p FROM Profile p
        LEFT JOIN p.specialistMetaData sm
        JOIN p.user u
        WHERE u.role = 'SPECIALIST'
        AND p.isDeleted = false
        AND (:name IS NULL OR p.name LIKE :name)
        AND (:gender IS NULL OR p.gender = :gender)
        AND (:maxBirthDate IS NULL OR p.birthday <= :maxBirthDate)
        AND (:minBirthDate IS NULL OR p.birthday >= :minBirthDate)
        AND (:minYearsOfExperience IS NULL OR sm.yearsOfExperience >= :minYearsOfExperience)
        AND (:priceFrom IS NULL OR sm.sessionPrice >= :priceFrom)
        AND (:priceTo IS NULL OR sm.sessionPrice <= :priceTo)
        AND (:providesFreeConsultation IS NULL OR sm.providesFreeConsultation = :providesFreeConsultation)
        AND (:city IS NULL OR p.city LIKE :city)
        AND (:minRating IS NULL OR sm.rating >= :minRating)
        """)
    Page<Profile> searchSpecialists(
            @Param("name") String name,
            @Param("gender") Gender gender,
            @Param("maxBirthDate") LocalDate maxBirthDate,
            @Param("minBirthDate") LocalDate minBirthDate,
            @Param("minYearsOfExperience") Integer minYearsOfExperience,
            @Param("priceFrom") Integer priceFrom,
            @Param("priceTo") Integer priceTo,
            @Param("providesFreeConsultation") Boolean providesFreeConsultation,
            @Param("city") String city,
            @Param("minRating") Double minRating,
            Pageable pageable
    );

    /**
     * Поиск специалистов по коллекциям (approaches, problemAreas и т.д.)
     */
    @Query("""
        SELECT DISTINCT p FROM Profile p
        LEFT JOIN p.specialistMetaData sm
        LEFT JOIN sm.approaches a
        LEFT JOIN sm.problemAreas pa
        LEFT JOIN sm.workFormats wf
        LEFT JOIN sm.targetAudiences ta
        JOIN p.user u
        WHERE u.role = 'SPECIALIST'
        AND p.isDeleted = false
        AND (:approaches IS NULL OR a IN :approaches)
        AND (:problemAreas IS NULL OR pa IN :problemAreas)
        AND (:workFormats IS NULL OR wf IN :workFormats)
        AND (:targetAudiences IS NULL OR ta IN :targetAudiences)
        """)
    Page<Profile> searchSpecialistsByCollections(
            @Param("approaches") Set<TherapyApproach> approaches,
            @Param("problemAreas") Set<ProblemArea> problemAreas,
            @Param("workFormats") Set<WorkFormat> workFormats,
            @Param("targetAudiences") Set<TargetAudience> targetAudiences,
            Pageable pageable
    );

    /**
     * Поиск пользователей для специалистов
     */
    @Query("""
        SELECT DISTINCT p FROM Profile p
        LEFT JOIN p.userMetaData um
        JOIN p.user u
        WHERE u.role = 'USER'
        AND p.isDeleted = false
        AND (:name IS NULL OR p.name LIKE :name)
        AND (:gender IS NULL OR p.gender = :gender)
        AND (:maxBirthDate IS NULL OR p.birthday <= :maxBirthDate)
        AND (:minBirthDate IS NULL OR p.birthday >= :minBirthDate)
        AND (:city IS NULL OR p.city LIKE :city)
        """)
    Page<Profile> searchUsers(
            @Param("name") String name,
            @Param("gender") Gender gender,
            @Param("maxBirthDate") LocalDate maxBirthDate,
            @Param("minBirthDate") LocalDate minBirthDate,
            @Param("city") String city,
            Pageable pageable
    );

    /**
     * Поиск пользователей по коллекциям (problemAreas, preferredApproaches и т.д.)
     */
    @Query("""
        SELECT DISTINCT p FROM Profile p
        LEFT JOIN p.userMetaData um
        LEFT JOIN um.problemAreas pa
        JOIN p.user u
        WHERE u.role = 'USER'
        AND p.isDeleted = false
        AND (:problemAreas IS NULL OR pa IN :problemAreas)""")
    Page<Profile> searchUsersByCollections(
            @Param("problemAreas") Set<ProblemArea> problemAreas,
            Pageable pageable
    );
}
