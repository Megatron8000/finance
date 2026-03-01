package org.example.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.dto.category.CategoryCreateRequest;
import org.example.dto.category.CategoryResponse;
import org.example.entity.Category;
import org.example.entity.User;
import org.example.enums.CategoryType;
import org.example.services.CategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Validated
public class CategoryController {

    private final CategoryService categoryService;

    /**
     * Получить список категорий пользователя по типу
     */
    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAll(
            @AuthenticationPrincipal User user,
            @RequestParam CategoryType type
    ) {
        List<CategoryResponse> response = categoryService.getCategories(user, type)
                .stream()
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(response);
    }

    /**
     * Создать новую категорию
     */
    @PostMapping
    public ResponseEntity<CategoryResponse> create(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CategoryCreateRequest request
    ) {
        Category category = categoryService.createCategory(
                user,
                request.name(),
                request.type()
        );
        CategoryResponse response = toResponse(category);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    private CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .type(category.getType())
                .system(category.isSystem())
                .build();
    }
}
