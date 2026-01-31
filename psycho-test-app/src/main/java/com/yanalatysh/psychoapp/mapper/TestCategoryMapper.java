package com.yanalatysh.psychoapp.mapper;

import com.yanalatysh.psychoapp.dto.TestCategoryDTO;
import com.yanalatysh.psychoapp.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface TestCategoryMapper {
    TestCategoryDTO fromCategoryToTestCategoryDTO(Category category);
}
