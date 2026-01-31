package com.yanalatysh.psychoapp.mapper;

import com.yanalatysh.psychoapp.dto.TestResultDTO;
import com.yanalatysh.psychoapp.dto.TestResultDetailsDTO;
import com.yanalatysh.psychoapp.entity.TestResult;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface TestResultMapper {
    @Mapping(source = "test.id", target = "testId")
    @Mapping(source = "test.name", target = "testName")
    @Mapping(source = "user.id", target = "userId")
    @Mapping(target = "interpretation", ignore = true) // Будет вычисляться в сервисе
    TestResultDTO fromTestResultToTestResultDTO(TestResult testResult);

    @Mapping(source = "test.id", target = "testId")
    @Mapping(source = "test.name", target = "testName")
    @Mapping(source = "user.id", target = "userId")
    @Mapping(target = "interpretation", ignore = true)
    @Mapping(target = "testAnswers", ignore = true)
    TestResultDetailsDTO fromTestResultToDetailsDTO(TestResult testResult);
}
