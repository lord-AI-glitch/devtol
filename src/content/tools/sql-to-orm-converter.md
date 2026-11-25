# SQL to ORM Schema Converter: Generate Prisma, SQLAlchemy, Drizzle, TypeORM & GORM

Migrating relational SQL database structures to Object-Relational Mappers (ORMs) is a ubiquitous task across backend and full-stack engineering. Manually re-typing tables, primary keys, foreign key constraints, column data types, and default expressions into framework-specific syntax is error-prone, tedious, and consumes valuable development cycles.

The **DevTol SQL to ORM Schema Converter** provides an automated, relationship-aware, zero-server bridge. It translates raw SQL DDL (`CREATE TABLE`) statements into clean, modern schemas for **Prisma**, **SQLAlchemy 2.0 (Mapped)**, **Drizzle ORM**, **TypeORM**, **Go GORM**, and **TypeScript Interfaces**.

---

## 1. Supported ORMs and Frameworks

| Target ORM / Framework | Language | Primary Syntax & Standards |
| :--- | :--- | :--- |
| **Prisma** | TypeScript / JS | `model`, `@id`, `@unique`, `@default()`, `@map()` |
| **SQLAlchemy 2.0** | Python 3 | `Mapped[T]`, `mapped_column()`, `DeclarativeBase`, `ForeignKey()` |
| **Drizzle ORM** | TypeScript / JS | `pgTable`, `serial`, `varchar`, `text`, `timestamp`, `numeric` |
| **TypeORM** | TypeScript | `@Entity()`, `@PrimaryGeneratedColumn()`, `@Column()`, `@CreateDateColumn()` |
| **Go GORM** | Golang | `struct`, struct tags `gorm:"primaryKey;autoIncrement"`, `json:"..."` |
| **TypeScript** | TypeScript | Strong typing interfaces with optional `?` and `null` union support |

---

## 2. Key Capabilities & Architecture

1. **Client-Side Privacy Guarantee**:
   All SQL DDL parsing and code generation algorithms execute strictly within your local browser environment. No proprietary database table names, column structures, or architectural metadata ever leave your machine.

2. **Relationship & Constraint Awareness**:
   The engine detects and normalizes:
   - Primary Keys: Inline (`id INT PRIMARY KEY`) and table-level (`PRIMARY KEY (id, tenant_id)`).
   - Foreign Keys: Inline `REFERENCES` and table-level `CONSTRAINT ... FOREIGN KEY ... REFERENCES ...`.
   - Nullability & Defaults: Accurate mapping of `NOT NULL`, `NULL`, `DEFAULT NOW()`, booleans, and numeric defaults.
   - Unique Indexes: Converted to native unique constraints in the target ORM.

3. **Casing Conventions**:
   Automatically adapts to target language idiomatic conventions:
   - TypeScript/Prisma: `camelCase` fields with `@map("snake_case")` or native mappings.
   - Python: `snake_case` attributes with explicit database column names.
   - Go: `PascalCase` exported struct fields with `json` and `gorm` tags.

---

## 3. Practical Example: Users & Posts Schema

### Input SQL
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Generated Prisma Schema
```prisma
model Users {
  id               Int          @id @default(autoincrement())
  email            String       @unique
  fullName         String?      @map("full_name")
  createdAt        DateTime     @default(now()) @map("created_at")
}

model Posts {
  id               Int          @id @default(autoincrement())
  userId           Int          @map("user_id")
  title            String       
  content          String?      
}
```

### Generated SQLAlchemy 2.0 (Modern Python Mapped)
```python
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase):
    pass

class Users(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class Posts(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[Optional[str]] = mapped_column(Text)
```

---

## 4. Frequently Asked Questions (FAQs)

### Which SQL database dialects are supported?
The parser accepts standard ANSI SQL, PostgreSQL, MySQL/MariaDB, and SQLite `CREATE TABLE` syntax. It handles database-specific column types such as PostgreSQL's `SERIAL`, `BIGSERIAL`, `JSONB`, `UUID`, and MySQL's `AUTO_INCREMENT`, `TINYINT`, `LONGTEXT`.

### Does this tool send my database schema over the network?
No. The conversion logic runs entirely on your client machine using JavaScript in the browser. Zero network requests containing your schema are transmitted to any server.

### How does the converter handle foreign key relationships in Prisma and SQLAlchemy?
Foreign key definitions are parsed from both column-level `REFERENCES` and table-level `CONSTRAINT ... FOREIGN KEY` clauses. In SQLAlchemy, it emits explicit `ForeignKey("table.col")` annotations. In Prisma, foreign key fields are mapped to their respective scalar foreign keys.

### Can I convert multiple SQL tables at the same time?
Yes. Simply paste multiple `CREATE TABLE` statements separated by semicolons or whitespace. The parser will detect all individual tables, parse each column and constraint, and generate complete multi-model schema files ready to copy or download.

### How do I use the generated schemas in my project?
Click **Copy Code** or **Download** in the upper right corner of the output pane. Save the downloaded file to your project root or models folder (e.g. `prisma/schema.prisma`, `app/models.py`, or `src/db/schema.ts`) and run your ORM's migration command.

---

## 5. Worked Example: The Same Schema as Drizzle

The same users-and-posts input from section 3, as Drizzle ORM (PostgreSQL dialect):

```typescript
// Drizzle ORM Schema generated from SQL (PostgreSQL dialect)
import { pgTable, serial, integer, bigint, varchar, text, boolean, timestamp, date, uuid, numeric, doublePrecision } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  fullName: varchar('full_name', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  content: text('content'),
});
```

The `SERIAL` and `AUTO_INCREMENT` markers both become `serial(...).primaryKey()`, the `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` column becomes `timestamp(...).defaultNow()`, and string lengths carry over exactly (`varchar('email', { length: 255 })`). One thing is missing: the foreign key from `posts.user_id` to `users.id` is only a plain `integer('user_id')` column — the Drizzle output emits no `.references()` call, so add it by hand if your schema needs the constraint.

---

## 6. Type Mapping Reference

| SQL types | Normalized type |
| --- | --- |
| `INT`, `INTEGER`, `SMALLINT`, `TINYINT`, `MEDIUMINT`, `SERIAL` | int |
| `BIGINT`, `BIGSERIAL` | bigint |
| `FLOAT`, `REAL`, `DOUBLE` | float |
| `DECIMAL`, `NUMERIC`, `MONEY` | decimal |
| `BOOLEAN`, `BOOL`, `BIT` | boolean |
| `UUID` | uuid |
| `JSON`, `JSONB` | json |
| `TIMESTAMP`, `TIMESTAMPTZ`, `DATETIME` | datetime |
| `DATE`, `YEAR` | date |
| `TEXT`, `LONGTEXT`, `MEDIUMTEXT`, `TINYTEXT` | text |
| `VARCHAR`, `NVARCHAR`, `CHAR`, `NCHAR`, `STRING` | string |
| `BLOB`, `BYTEA`, `VARBINARY`, `BINARY` | binary |

Types the converter does not recognize fall back to `unknown` and are generated as plain string columns.

---

## 7. What the Converter Does Not Emit

Foreign keys are parsed from inline `REFERENCES` and table-level `CONSTRAINT ... FOREIGN KEY` clauses, but only the SQLAlchemy output renders them — as `ForeignKey("users.id")`. Prisma, Drizzle, TypeORM, and GORM keep the column as a plain scalar field (`userId: Int` in Prisma), with no `@relation`, `.references()`, or decorator. Add the relation by hand after pasting: Prisma `@relation(fields: [userId], references: [id])`, or Drizzle `.references(() => users.id)`.
