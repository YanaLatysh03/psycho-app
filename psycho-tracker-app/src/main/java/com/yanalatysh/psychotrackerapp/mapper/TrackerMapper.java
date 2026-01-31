package com.yanalatysh.psychotrackerapp.mapper;


import com.yanalatysh.psychotrackerapp.dto.TrackerEntryRequestDTO;
import com.yanalatysh.psychotrackerapp.dto.TrackerEntryResponseDTO;
import com.yanalatysh.psychotrackerapp.entity.Tracker;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface TrackerMapper {
    @Mapping(target = "entryDatetime", expression = "java(request.getEntryDatetime() != null ? request.getEntryDatetime() : java.time.LocalDateTime.now())")
    Tracker fromRequestDtoToTracker(TrackerEntryRequestDTO request);

    @Mapping(source = "user.id", target = "userId")
    TrackerEntryResponseDTO fromTrackerToResponseDto(Tracker tracker);
}
