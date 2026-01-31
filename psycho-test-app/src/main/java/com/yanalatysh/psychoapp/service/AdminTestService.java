package com.yanalatysh.psychoapp.service;

import com.yanalatysh.psychoapp.dto.CreateTestRequestDTO;
import com.yanalatysh.psychoapp.dto.TestDTO;
import com.yanalatysh.psychoapp.entity.AnswerOption;
import com.yanalatysh.psychoapp.entity.Test;
import com.yanalatysh.psychoapp.entity.TestQuestion;
import com.yanalatysh.psychoapp.mapper.TestMapper;
import com.yanalatysh.psychoapp.repository.TestCategoryRepository;
import com.yanalatysh.psychoapp.repository.TestRepository;
import lombok.Data;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Data
public class AdminTestService {

    private final TestCategoryRepository categoryRepository;
    private final TestRepository testRepository;
    private final TestMapper testMapper;

    @Transactional
    public TestDTO createTest(CreateTestRequestDTO request) {
        var test = new Test();

        test.setName(request.getName());
        test.setDescription(request.getDescription());
        test.setMinScore(request.getMinScore());
        test.setMaxScore(request.getMaxScore());
        test.setCreatedAt(LocalDateTime.now());
        test.setUpdatedAt(LocalDateTime.now());

        var category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + request.getCategoryId()));

        category.getTests().add(test);

        test.setCategory(category);

        var questionsDto = request.getQuestions();
        var finalTest = test;
        var questions = questionsDto.stream().map(q -> {
            var question = new TestQuestion();
            question.setQuestion(q.getQuestion());
            question.setMinScore(q.getMinScore());
            question.setMaxScore(q.getMaxScore());
            question.setCreatedAt(LocalDateTime.now());
            question.setUpdatedAt(LocalDateTime.now());
            question.setTest(finalTest);

            var answerOptions = q.getAnswerOptions().stream().map(a -> {
                var answerOption = new AnswerOption();
                answerOption.setTestQuestion(question);
                answerOption.setAnswer(a.getAnswer());
                answerOption.setScore(a.getScore());
                answerOption.setCreatedAt(LocalDateTime.now());
                answerOption.setUpdatedAt(LocalDateTime.now());

                return answerOption;
            }).toList();

            // Добавляем варианты к вопросу
            if (question.getAnswerOptions() == null)
                question.setAnswerOptions(answerOptions);

            return question;
        }).toList();

        // Добавляем вопросы к тесту
        if (test.getTestQuestions() == null)
            test.setTestQuestions(questions);

        // Сохраняем тест (каскадно сохранятся вопросы и варианты ответов)
        test = testRepository.save(test);

        return testMapper.fromTestToTestDto(test);
    }

    public void deleteTest(Long id) {
        var test = testRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Test not found with id: " + id));

        testRepository.delete(test);
    }
}
