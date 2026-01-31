package com.yanalatysh.psychoapp.service;

import com.yanalatysh.psychoapp.dto.TestDTO;
import com.yanalatysh.psychoapp.dto.TestDetailsDTO;
import com.yanalatysh.psychoapp.dto.TestResultDTO;
import com.yanalatysh.psychoapp.dto.TestResultDetailsDTO;
import com.yanalatysh.psychoapp.entity.TestAnswer;
import com.yanalatysh.psychoapp.entity.TestAnswerId;
import com.yanalatysh.psychoapp.entity.TestResult;
import com.yanalatysh.psychoapp.mapper.*;
import com.yanalatysh.psychoapp.repository.*;
import com.yanalatysh.psychoapp.rq.SubmitTestRq;
import com.yanalatysh.psychoapp.util.ScoreInterpretationUtil;
import lombok.Data;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Data
public class TestService {

    private final TestRepository testRepository;
    private final UserRepository userRepository;
    private final AnswerOptionRepository answerOptionRepository;
    private final TestQuestionRepository testQuestionRepository;
    private final TestResultRepository testResultRepository;
    private final TestMapper testMapper;
    private final TestResultMapper testResultMapper;
    private final TestAnswerMapper testAnswerMapper;
    private final TestQuestionMapper testQuestionMapper;
    private final AnswerOptionsMapper answerOptionsMapper;

    public List<TestDTO> getAllTests() {
        return testRepository.findAll().stream()
                .map(testMapper::fromTestToTestDto)
                .collect(Collectors.toList());
    }

    public TestDetailsDTO getTestById(Long id) {
         var test = testRepository.findById(id)
                 .orElseThrow(() -> new RuntimeException("Test not found with id: " + id));

         var testDto = testMapper.fromTestToTestDetailsDTO(test);

         var testQuestionDTOs = test.getTestQuestions()
                 .stream().map(q -> {
                     var questionDto = testQuestionMapper.fromTestQuestionToTestQuestionDTO(q);

                     var answerOptions = q.getAnswerOptions()
                             .stream()
                             .map(answerOptionsMapper::fromAnswerOptionToAnswerOptionDTO).toList();
                     questionDto.setAnswerOptions(answerOptions);

                     return questionDto;
                 })
                 .toList();

         testDto.setTestQuestions(testQuestionDTOs);
         return testDto;
    }

    public List<TestDTO> getTestsByCategoryId(Long categoryId) {
        return testRepository.findAllByCategoryId(categoryId)
                .stream().map(testMapper::fromTestToTestDto)
                .collect(Collectors.toList());
    }

    // Метод для отправки ответов на тест и получения результата
    @Transactional
    public TestResultDTO submitTest(Long testId, SubmitTestRq request, Long userId) {
        // Проверяем существование теста
        var test = testRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Test not found with id: " + testId));

        // Проверяем существование пользователя
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Создаем результат теста
        TestResult testResult = new TestResult();
        testResult.setTest(test);
        testResult.setUser(user);
        testResult.setTestDatetime(LocalDateTime.now());
        testResult.setCreatedAt(LocalDateTime.now());
        testResult.setUpdatedAt(LocalDateTime.now());

        // Сначала сохраняем testResult, чтобы получить его ID
        testResult = testResultRepository.save(testResult);
        var testResultId = testResult.getId();

        int totalScore = 0;

        // Проходимся по каждому ответу, берем вариант ответа и прибавляем к общему количеству
        for (var answer : request.getAnswers()) {
            var answerOption = answerOptionRepository.findById(answer.getAnswerOptionId())
                    .orElseThrow(() -> new RuntimeException("Answer option not found with id: " + answer.getAnswerOptionId()));

            var testQuestion = testQuestionRepository.findById(answer.getQuestionId())
                    .orElseThrow(() -> new RuntimeException("Question not found with id: " + answer.getQuestionId()));

            totalScore += answerOption.getScore();

            // Создаем ответ пользователя
            var testAnswer = new TestAnswer();
            testAnswer.setAnswer(answerOption.getAnswer());
            testAnswer.setScore(answerOption.getScore());
            testAnswer.setCreatedAt(LocalDateTime.now());
            testAnswer.setUpdatedAt(LocalDateTime.now());
            testAnswer.setTestResult(testResult);

            // Инициализируем составной ключ
            var answerId = new TestAnswerId(testQuestion.getId(), testResultId);
            testAnswer.setId(answerId);

            testAnswer.setTestQuestion(testQuestion);

            // Добавляем ответ к результату
            if (testResult.getTestAnswers() != null) {
                testResult.getTestAnswers().add(testAnswer);
            }
            else {
                var testAnswers = new ArrayList<TestAnswer>();
                testAnswers.add(testAnswer);
                testResult.setTestAnswers(testAnswers);
            }
        }

        testResult.setScore(totalScore);

        testResult = testResultRepository.save(testResult);

        testResultRepository.save(testResult);

        var testResultDto = testResultMapper.fromTestResultToTestResultDTO(testResult);
        testResultDto.setInterpretation(ScoreInterpretationUtil.interpretScore(totalScore, test.getMinScore(), test.getMaxScore()));

        return  testResultDto;
    }
}
