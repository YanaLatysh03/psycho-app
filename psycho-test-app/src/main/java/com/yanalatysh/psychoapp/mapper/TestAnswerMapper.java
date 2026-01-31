package com.yanalatysh.psychoapp.mapper;

import com.yanalatysh.psychoapp.dto.TestAnswerDTO;
import com.yanalatysh.psychoapp.entity.TestAnswer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface TestAnswerMapper {
    @Mapping(source = "testQuestion.id", target = "testQuestionId")
    @Mapping(source = "testQuestion.question", target = "questionText")
    TestAnswerDTO fromTestAnswerToTestAnswerDTO(TestAnswer answer);
}
