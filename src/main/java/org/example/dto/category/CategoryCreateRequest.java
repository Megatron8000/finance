package org.example.dto.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.example.enums.CategoryType;

public record CategoryCreateRequest(
        @NotBlank String name,
        @NotNull CategoryType type
) {}