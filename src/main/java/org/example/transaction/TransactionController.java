package org.example.transaction;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionRepository repo;

    @GetMapping
    public List<Transaction> get(@RequestParam UUID userId) {
        return repo.findByUserId(userId);
    }

    @PostMapping
    public Transaction add(@RequestBody Transaction t) {
        t.setDate(LocalDateTime.now());
        return repo.save(t);
    }
}

