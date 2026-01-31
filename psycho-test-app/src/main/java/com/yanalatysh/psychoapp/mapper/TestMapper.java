package com.yanalatysh.psychoapp.mapper;

import com.yanalatysh.psychoapp.dto.TestDTO;
import com.yanalatysh.psychoapp.dto.TestDetailsDTO;
import com.yanalatysh.psychoapp.entity.Test;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface TestMapper {
    @Mapping(source = "category.id", target = "categoryId")
    @Mapping(source = "category.name", target = "categoryName")
    TestDTO fromTestToTestDto(Test test);

    @Mapping(source = "category.id", target = "categoryId")
    @Mapping(source = "category.name", target = "categoryName")
    @Mapping(target = "testQuestions", ignore = true)
    TestDetailsDTO fromTestToTestDetailsDTO(Test test);
}
