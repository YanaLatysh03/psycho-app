package com.yanalatysh.psychoapp.util;

public class ScoreInterpretationUtil {

    // Метод для интерпретации результатов теста
    public static String interpretScore(int score, int minScore, int maxScore) {
        if (minScore == maxScore) {
            return "Результат не может быть интерпретирован";
        }

        double percentage = ((double) (score - minScore) / (maxScore - minScore)) * 100;

        if (percentage < 25) {
            return "Очень низкий уровень";
        } else if (percentage < 50) {
            return "Низкий уровень";
        } else if (percentage < 75) {
            return "Средний уровень";
        } else {
            return "Высокий уровень";
        }
    }
}
