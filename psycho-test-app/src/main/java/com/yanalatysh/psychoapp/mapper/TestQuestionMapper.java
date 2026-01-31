package com.yanalatysh.psychoapp.mapper;

import com.yanalatysh.psychoapp.dto.TestQuestionDTO;
import com.yanalatysh.psychoapp.entity.TestQuestion;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface TestQuestionMapper {

    @Mapping(source = "test.id", target = "testId")
    @Mapping(target = "answerOptions", ignore = true)
    TestQuestionDTO fromTestQuestionToTestQuestionDTO(TestQuestion testQuestion);
}
