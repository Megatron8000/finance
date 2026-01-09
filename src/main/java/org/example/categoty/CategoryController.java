package org.example.categoty;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository repo;

    @GetMapping
    public List<Category> get(@RequestParam UUID userId) {
        return repo.findByUserIdOrIsDefaultTrue(userId);
    }

    @PostMapping
    public Category add(@RequestBody Category c) {
        return repo.save(c);
    }
}



