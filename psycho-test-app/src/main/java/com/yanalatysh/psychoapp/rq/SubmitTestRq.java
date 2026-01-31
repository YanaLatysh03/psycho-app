package com.yanalatysh.psychoapp.rq;

import com.yanalatysh.psychoapp.dto.QuestionAnswerDTO;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class SubmitTestRq {
    @NotNull(message = "Answers are required")
    private List<QuestionAnswerDTO> answers;
}
