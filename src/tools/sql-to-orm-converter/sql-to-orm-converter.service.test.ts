import { describe, expect, it } from 'vitest';
import {
  parseSqlSchema,
  generatePrisma,
  generateSqlAlchemy,
  generateDrizzle,
  generateTypeOrm,
  generateGorm,
  generateTypeScript,
  convertSqlToOrm,
} from './sql-to-orm-converter.service';

const sampleSql = `
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);
`;

describe('sql-to-orm-converter.service', () => {
  describe('parseSqlSchema', () => {
    it('should parse multiple tables and their columns correctly', () => {
      const tables = parseSqlSchema(sampleSql);
      expect(tables.length).toBe(2);

      const users = tables[0];
      expect(users.name).toBe('users');
      expect(users.columns.length).toBe(5);

      const idCol = users.columns.find(c => c.name === 'id');
      expect(idCol).toBeDefined();
      expect(idCol?.isPrimaryKey).toBe(true);
      expect(idCol?.isAutoIncrement).toBe(true);
      expect(idCol?.normalizedType).toBe('int');

      const emailCol = users.columns.find(c => c.name === 'email');
      expect(emailCol?.isUnique).toBe(true);
      expect(emailCol?.isNullable).toBe(false);

      const posts = tables[1];
      expect(posts.name).toBe('posts');
      const userIdCol = posts.columns.find(c => c.name === 'user_id');
      expect(userIdCol?.foreignKey).toEqual({
        table: 'users',
        column: 'id',
      });
    });
  });

  describe('generatePrisma', () => {
    it('should generate valid Prisma schema models', () => {
      const tables = parseSqlSchema(sampleSql);
      const prisma = generatePrisma(tables);

      expect(prisma).toContain('model Users {');
      expect(prisma).toMatch(/id\s+Int\s+@id\s+@default\(autoincrement\(\)\)/);
      expect(prisma).toMatch(/email\s+String\s+@unique/);
      expect(prisma).toMatch(/fullName\s+String\?\s+@map\("full_name"\)/);
      expect(prisma).toContain('@default(now())');
    });
  });

  describe('generateSqlAlchemy', () => {
    it('should generate modern SQLAlchemy 2.0 Mapped models', () => {
      const tables = parseSqlSchema(sampleSql);
      const sqla = generateSqlAlchemy(tables);

      expect(sqla).toContain('class Users(Base):');
      expect(sqla).toContain('__tablename__ = "users"');
      expect(sqla).toMatch(/id:\s*Mapped\[int\]\s*=\s*mapped_column\(Integer,\s*primary_key=True,\s*autoincrement=True\)/);
      expect(sqla).toMatch(/email:\s*Mapped\[str\]\s*=\s*mapped_column\(String\(255\),\s*unique=True,\s*nullable=False\)/);
      expect(sqla).toMatch(/full_name:\s*Mapped\[Optional\[str\]\]\s*=\s*mapped_column\(String\(100\)\)/);
      expect(sqla).toContain('ForeignKey("users.id")');
    });
  });

  describe('generateDrizzle', () => {
    it('should generate PostgreSQL Drizzle ORM schemas', () => {
      const tables = parseSqlSchema(sampleSql);
      const drizzle = generateDrizzle(tables);

      expect(drizzle).toContain("export const users = pgTable('users', {");
      expect(drizzle).toContain("id: serial('id').primaryKey()");
      expect(drizzle).toMatch(/email:\s*varchar\('email',\s*\{\s*length:\s*255\s*\}\)\.notNull\(\)\.unique\(\)/);
      expect(drizzle).toContain('.defaultNow()');
    });
  });

  describe('generateTypeOrm', () => {
    it('should generate TypeScript TypeORM entities', () => {
      const tables = parseSqlSchema(sampleSql);
      const typeorm = generateTypeOrm(tables);

      expect(typeorm).toContain("@Entity('users')");
      expect(typeorm).toContain('export class Users {');
      expect(typeorm).toContain('@PrimaryGeneratedColumn()');
      expect(typeorm).toContain('id: number;');
      expect(typeorm).toMatch(/fullName\?:\s*string;/);
    });
  });

  describe('generateGorm', () => {
    it('should generate Go GORM structs with struct tags', () => {
      const tables = parseSqlSchema(sampleSql);
      const gorm = generateGorm(tables);

      expect(gorm).toContain('type Users struct {');
      expect(gorm).toMatch(/(?:ID|Id)\s+int\s+`gorm:"[^"]*primaryKey[^"]*autoIncrement[^"]*"/);
      expect(gorm).toMatch(/Email\s+string\s+`gorm:"[^"]*unique[^"]*"/);
      expect(gorm).toMatch(/FullName\s+\*string/);
    });
  });

  describe('generateTypeScript', () => {
    it('should generate clean TypeScript interfaces', () => {
      const tables = parseSqlSchema(sampleSql);
      const ts = generateTypeScript(tables);

      expect(ts).toContain('export interface Users {');
      expect(ts).toContain('id: number;');
      expect(ts).toMatch(/email:\s*string;/);
      expect(ts).toMatch(/fullName\?:\s*string\s*\|\s*null;/);
    });
  });

  describe('convertSqlToOrm', () => {
    it('should dispatch to the requested target ORM correctly', () => {
      const prismaRes = convertSqlToOrm(sampleSql, 'prisma');
      expect(prismaRes).toContain('model Users {');

      const drizzleRes = convertSqlToOrm(sampleSql, 'drizzle');
      expect(drizzleRes).toContain("export const users = pgTable('users'");
    });
  });
});
