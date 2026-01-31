package com.yanalatysh.psychoapp.mapper;

import com.yanalatysh.psychoapp.dto.AnswerOptionDTO;
import com.yanalatysh.psychoapp.entity.AnswerOption;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface AnswerOptionsMapper {

    AnswerOptionDTO fromAnswerOptionToAnswerOptionDTO(AnswerOption answerOption);
}
