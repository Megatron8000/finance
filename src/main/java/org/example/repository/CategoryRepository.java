package org.example.repository;

import org.example.entity.Category;
import org.example.entity.User;
import org.example.enums.CategoryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {

    /**
     * Возвращает категории заданного типа,
     * которые либо принадлежат пользователю,
     * либо являются системными.
     *
     * Логика:
     * (c.user = :user OR c.system = true)
     * AND c.type = :type
     */
    @Query("""
        select c
        from Category c
        where c.type = :type
          and (c.user = :user or c.isSystem = true)
    """)
    List<Category> findAllByTypeAndUserOrSystem(
            @Param("type") CategoryType type,
            @Param("user") User user
    );
}