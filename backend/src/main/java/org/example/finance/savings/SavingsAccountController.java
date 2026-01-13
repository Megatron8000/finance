package org.example.finance.savings;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/savings")
@RequiredArgsConstructor
public class SavingsAccountController {

    private final SavingsAccountService service;
    private final SavingsAccountRepository repo;

    @PostMapping
    public SavingsAccount create(@RequestBody CreateSavingsRequest r) {
        return service.create(
                r.userId(),
                r.amount(),
                r.rate(),
                r.termMonths()
        );
    }

    @PostMapping("/{id}/deposit")
    public SavingsAccount deposit(
            @PathVariable UUID id,
            @RequestParam BigDecimal amount
    ) {
        return service.deposit(id, amount);
    }

    @GetMapping
    public List<SavingsAccount> get(@RequestParam UUID userId) {
        return repo.findByUserId(userId);
    }
}

record CreateSavingsRequest(
        UUID userId,
        BigDecimal amount,
        BigDecimal rate,
        int termMonths
) {}

