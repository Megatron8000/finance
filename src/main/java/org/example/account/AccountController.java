package org.example.account;


import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountRepository repo;

    @GetMapping
    public List<Account> get(@RequestParam UUID userId) {
        return repo.findByUserId(userId);
    }

    @PostMapping
    public Account add(@RequestBody Account a) {
        return repo.save(a);
    }
}


