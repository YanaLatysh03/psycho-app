package com.yanalatysh.psychoapp.service;

import com.yanalatysh.psychoapp.dto.AnonymousTestResultDTO;
import com.yanalatysh.psychoapp.dto.TestResultDTO;
import com.yanalatysh.psychoapp.dto.TestResultDetailsDTO;
import com.yanalatysh.psychoapp.entity.TestResult;
import com.yanalatysh.psychoapp.mapper.TestAnswerMapper;
import com.yanalatysh.psychoapp.mapper.TestResultMapper;
import com.yanalatysh.psychoapp.repository.ProfileRepository;
import com.yanalatysh.psychoapp.repository.TestResultRepository;
import com.yanalatysh.psychoapp.util.ScoreInterpretationUtil;
import lombok.Data;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Data
public class TestResultService {

    private final TestResultRepository testResultRepository;
    private final ProfileRepository profileRepository;
    private final TestResultMapper testResultMapper;
    private final TestAnswerMapper testAnswerMapper;

    // Получить все результаты пользователя
    public List<TestResultDTO> getMyTestResults(Long currentUserId) {
        var testResults = testResultRepository.findAllByUserId(currentUserId);
        return testResults.stream().map(t -> {
            var dto = testResultMapper.fromTestResultToTestResultDTO(t);
            dto.setInterpretation(ScoreInterpretationUtil.interpretScore(dto.getScore(), t.getTest().getMinScore(), t.getTest().getMaxScore()));
            return dto;
        }).collect(Collectors.toList());
    }

    // Получить результаты пользователя специалистом, чьим пациентом он является
    public List<TestResultDTO> getResultsByUserId(Long userId, Long currentUserId) {
        var userProfile = profileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found with id: " + userId));

        if (userProfile.getUserMetaData() != null
                && userProfile.getUserMetaData().getCurrentTherapistId() == currentUserId) {
            var testResults = testResultRepository.findAllByUserId(userId);
            return testResults.stream().map(t -> {
                var dto = testResultMapper.fromTestResultToTestResultDTO(t);
                dto.setInterpretation(ScoreInterpretationUtil.interpretScore(dto.getScore(), t.getTest().getMinScore(), t.getTest().getMaxScore()));
                return dto;
            }).collect(Collectors.toList());
        }
        else {
            throw new RuntimeException("User doesn't have specialist with id " + currentUserId);
        }
    }

    // Получить результат по ID
    public TestResultDTO getResultById(Long resultId, Long currentUserId) {
        var testResult = testResultRepository.findById(resultId)
                .orElseThrow(() -> new RuntimeException("Result not found with id: " + resultId));

        if (testResult.getUser().getId() != currentUserId)
            throw new RuntimeException("CurrentUserId is not equal userId from result");

        var testResultDto = testResultMapper.fromTestResultToTestResultDTO(testResult);
        testResultDto.setInterpretation(
                ScoreInterpretationUtil.interpretScore(testResultDto.getScore(), testResult.getTest().getMinScore(), testResult.getTest().getMaxScore()));

        return testResultDto;
    }

    // Получить все результаты конкретного теста
    public List<AnonymousTestResultDTO> getResultsByTestId(Long testId) {
        List<TestResult> results = testResultRepository.findAllByTestId(testId);
        return results.stream()
                .map(result -> {
                    var dto = testResultMapper.fromTestResultToAnonymousTestResultDTO(result);
                    dto.setInterpretation(ScoreInterpretationUtil.interpretScore(result.getScore(),
                            result.getTest().getMinScore(),
                            result.getTest().getMaxScore()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // Метод для получения детальной информации о результате с ответами пользователя
    public TestResultDetailsDTO getResultDetailsById(Long resultId, Long currentUserId) {
        var testResult = testResultRepository.findById(resultId)
                .orElseThrow(() -> new RuntimeException("Result not found with id: " + resultId));

        if (testResult.getUser().getId() == currentUserId
                || (testResult.getUser().getProfile().getUserMetaData() != null
                && testResult.getUser().getProfile().getUserMetaData().getId() == currentUserId)) {
            var detailsResultDto = testResultMapper.fromTestResultToDetailsDTO(testResult);

            detailsResultDto.setInterpretation(ScoreInterpretationUtil.interpretScore(detailsResultDto.getScore(),
                    testResult.getTest().getMinScore(),
                    testResult.getTest().getMaxScore()));

            var testAnswerDtos = testResult.getTestAnswers().stream()
                    .map(testAnswerMapper::fromTestAnswerToTestAnswerDTO
                    ).collect(Collectors.toList());

            detailsResultDto.setTestAnswers(testAnswerDtos);
            return detailsResultDto;
        }
        else {
            throw new RuntimeException("Don't have access to this result");
        }


    }
}
