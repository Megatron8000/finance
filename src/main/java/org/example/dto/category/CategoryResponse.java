package org.example.dto.category;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.example.enums.CategoryType;

import java.util.UUID;

/**
 * DTO, используемый в ответах API для отображения категории.
 */
@Getter
@Builder
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CategoryResponse {

    /**
     * ID категории.
     */
    private UUID id;

    /**
     * Название категории.
     */
    private String name;

    /**
     * Тип категории (INCOME / EXPENSE).
     */
    private CategoryType type;

    /**
     * Является ли категория системной (нельзя удалить).
     */
    private boolean system;
}
