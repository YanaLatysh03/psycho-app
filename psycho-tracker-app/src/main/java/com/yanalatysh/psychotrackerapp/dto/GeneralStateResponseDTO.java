package com.yanalatysh.psychotrackerapp.dto;

import com.yanalatysh.psychotrackerapp.entity.GeneralState;
import lombok.Data;

@Data
public class GeneralStateResponseDTO {
    private Long id;
    private GeneralState generalState;
}
