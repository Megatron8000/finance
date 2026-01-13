-- =========================
-- USERS
-- =========================
CREATE TABLE users (
                       id UUID PRIMARY KEY,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password VARCHAR(255) NOT NULL
);

-- =========================
-- ACCOUNTS (CASH / CARD)
-- =========================
CREATE TABLE account (
                         id UUID PRIMARY KEY,
                         name VARCHAR(100) NOT NULL,
                         type VARCHAR(20) NOT NULL,
                         user_id UUID NOT NULL,
                         CONSTRAINT fk_account_user
                             FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =========================
-- CATEGORIES
-- =========================
CREATE TABLE category (
                          id UUID PRIMARY KEY,
                          name VARCHAR(100) NOT NULL,
                          type VARCHAR(20) NOT NULL,
                          is_default BOOLEAN NOT NULL,
                          user_id UUID,
                          CONSTRAINT fk_category_user
                              FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =========================
-- TRANSACTIONS
-- =========================
CREATE TABLE transactions (
                              id UUID PRIMARY KEY,
                              amount NUMERIC(12,2) NOT NULL,
                              type VARCHAR(20) NOT NULL,
                              date TIMESTAMP NOT NULL,
                              category_id UUID NOT NULL,
                              account_id UUID NOT NULL,
                              user_id UUID NOT NULL,

                              CONSTRAINT fk_transaction_category
                                  FOREIGN KEY (category_id) REFERENCES category(id),

                              CONSTRAINT fk_transaction_account
                                  FOREIGN KEY (account_id) REFERENCES account(id),

                              CONSTRAINT fk_transaction_user
                                  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =========================
-- SAVINGS ACCOUNTS
-- =========================
CREATE TABLE savings_account (
                                 id UUID PRIMARY KEY,
                                 user_id UUID NOT NULL,

                                 initial_amount NUMERIC(12,2) NOT NULL,
                                 current_amount NUMERIC(12,2) NOT NULL,
                                 interest_rate NUMERIC(5,2) NOT NULL,
                                 term_months INTEGER NOT NULL,

                                 start_date DATE NOT NULL,
                                 end_date DATE NOT NULL,
                                 expected_income NUMERIC(12,2) NOT NULL,

                                 CONSTRAINT fk_savings_user
                                     FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =========================
-- DEFAULT CATEGORIES (INCOME)
-- =========================
INSERT INTO category (id, name, type, is_default, user_id)
VALUES
    (gen_random_uuid(), 'Зарплата', 'INCOME', true, NULL),
    (gen_random_uuid(), 'Продажа', 'INCOME', true, NULL),
    (gen_random_uuid(), 'Подарок', 'INCOME', true, NULL);

-- =========================
-- DEFAULT CATEGORIES (EXPENSE)
-- =========================
INSERT INTO category (id, name, type, is_default, user_id)
VALUES
    (gen_random_uuid(), 'Продукты питания', 'EXPENSE', true, NULL),
    (gen_random_uuid(), 'Расходы на питомцев', 'EXPENSE', true, NULL),
    (gen_random_uuid(), 'Коммунальные платежи', 'EXPENSE', true, NULL),
    (gen_random_uuid(), 'Обслуживание автомобиля', 'EXPENSE', true, NULL);
