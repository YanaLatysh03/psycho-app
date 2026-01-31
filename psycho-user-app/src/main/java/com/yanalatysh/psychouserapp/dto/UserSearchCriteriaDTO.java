package com.yanalatysh.psychouserapp.dto;

import com.yanalatysh.psychouserapp.entity.Gender;
import com.yanalatysh.psychouserapp.entity.ProblemArea;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSearchCriteriaDTO {
    // Базовые критерии из Profile
    private String name;
    private Gender gender;
    private Integer ageFrom;
    private Integer ageTo;

    private Set<ProblemArea> problemAreas;   // С какими проблемами обращается

    private String city;

    // Параметры пагинации и сортировки
    private Integer page = 0;
    private Integer size = 10;
    private String sortBy = "name";  // поле для сортировки
    private String sortDirection = "DESC"; // ASC или DESC
}
