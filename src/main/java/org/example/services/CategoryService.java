package org.example.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.entity.Category;
import org.example.entity.User;
import org.example.enums.CategoryType;
import org.example.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryService {

    /**
     * Репозиторий для работы с категориями.
     * Инжектится через constructor injection (Lombok @RequiredArgsConstructor).
     */
    private final CategoryRepository categoryRepository;

    /**
     * Получить список категорий по типу (INCOME / EXPENSE),
     * доступных конкретному пользователю.
     *
     * Логика:
     * - возвращает как пользовательские категории (user = текущий пользователь),
     * - так и системные категории (system = true),
     * если они подходят по типу.
     *
     * @param user текущий пользователь
     * @param type тип категории (доход / расход)
     * @return список категорий
     */
    public List<Category> getCategories(User user, CategoryType type) {
        // ВАЖНО:
        // Метод репозитория должен корректно обрабатывать условие:
        // (category.user = user OR category.system = true) AND category.type = type
        return categoryRepository.findAllByTypeAndUserOrSystem(type, user);
    }

    /**
     * Создание пользовательской категории.
     *
     * Используется @Transactional, так как:
     * - операция записи в БД
     * - в будущем здесь может появиться дополнительная логика
     *   (проверки, связанные сущности и т.п.)
     *
     * @param user пользователь, которому принадлежит категория
     * @param name название категории
     * @param type тип категории (INCOME / EXPENSE)
     * @return сохранённая категория
     */
    @Transactional
    public Category createCategory(User user, String name, CategoryType type) {

        // Создаём новую сущность категории
        Category category = new Category();

        // Генерируем UUID вручную
        // (актуально, если @Id не генерируется на уровне БД)
        category.setId(UUID.randomUUID());

        // Привязываем категорию к пользователю
        category.setUser(user);

        // Устанавливаем название категории
        category.setName(name);

        // Устанавливаем тип категории
        category.setType(type);

        // Помечаем, что категория НЕ системная,
        // а создана конкретным пользователем
        category.setSystem(false);

        // Сохраняем категорию в БД
        return categoryRepository.save(category);
    }
}
