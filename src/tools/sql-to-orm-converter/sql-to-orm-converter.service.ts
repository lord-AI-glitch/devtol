export interface SqlColumn {
  name: string;
  rawType: string;
  normalizedType: 'int' | 'bigint' | 'float' | 'decimal' | 'string' | 'text' | 'boolean' | 'date' | 'datetime' | 'uuid' | 'json' | 'binary' | 'unknown';
  length?: number;
  precision?: number;
  scale?: number;
  isPrimaryKey: boolean;
  isAutoIncrement: boolean;
  isNullable: boolean;
  isUnique: boolean;
  defaultValue?: string;
  foreignKey?: {
    table: string;
    column: string;
  };
}

export interface SqlTable {
  name: string;
  columns: SqlColumn[];
  primaryKeys: string[];
}

export type OrmTarget = 'prisma' | 'sqlalchemy' | 'drizzle' | 'typeorm' | 'gorm' | 'typescript';

// Casing utilities
export function toPascalCase(str: string): string {
  return str
    .replace(/[_\-\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, c => c.toUpperCase());
}

export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

export function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z\d])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toLowerCase();
}

/**
 * Normalizes SQL data type to internal canonical type.
 */
export function normalizeSqlType(rawType: string): SqlColumn['normalizedType'] {
  const type = rawType.toUpperCase().trim();

  if (/^(INT|INTEGER|SMALLINT|TINYINT|MEDIUMINT|SERIAL)/i.test(type)) return 'int';
  if (/^(BIGINT|BIGSERIAL)/i.test(type)) return 'bigint';
  if (/^(FLOAT|REAL|DOUBLE)/i.test(type)) return 'float';
  if (/^(DECIMAL|NUMERIC|MONEY)/i.test(type)) return 'decimal';
  if (/^(BOOLEAN|BOOL|BIT)/i.test(type)) return 'boolean';
  if (/^(UUID)/i.test(type)) return 'uuid';
  if (/^(JSON|JSONB)/i.test(type)) return 'json';
  if (/^(TIMESTAMP|TIMESTAMPTZ|DATETIME)/i.test(type)) return 'datetime';
  if (/^(DATE|YEAR)/i.test(type)) return 'date';
  if (/^(TEXT|LONGTEXT|MEDIUMTEXT|TINYTEXT)/i.test(type)) return 'text';
  if (/^(VARCHAR|NVARCHAR|CHAR|NCHAR|STRING)/i.test(type)) return 'string';
  if (/^(BLOB|BYTEA|VARBINARY|BINARY)/i.test(type)) return 'binary';

  return 'unknown';
}

/**
 * Parses raw SQL CREATE TABLE statements into structured table objects.
 */
export function parseSqlSchema(sql: string): SqlTable[] {
  const tables: SqlTable[] = [];

  // Remove single-line comments (-- ...) and multi-line comments (/* ... */)
  const cleanSql = sql
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//gm, '');

  const headerRegex = /CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+[`"']?([a-zA-Z0-9_]+)[`"']?\s*\(/gim;
  let match: RegExpExecArray | null;

  while ((match = headerRegex.exec(cleanSql)) !== null) {
    const tableName = match[1];
    const startIndex = headerRegex.lastIndex; // right after '('
    let parenDepth = 1;
    let endIndex = startIndex;

    while (endIndex < cleanSql.length && parenDepth > 0) {
      const c = cleanSql[endIndex];
      if (c === '(') {
        parenDepth++;
      } else if (c === ')') {
        parenDepth--;
      }
      endIndex++;
    }

    const body = cleanSql.slice(startIndex, endIndex - 1);
    headerRegex.lastIndex = endIndex;

    const table: SqlTable = {
      name: tableName,
      columns: [],
      primaryKeys: [],
    };

    // Split body by commas that are NOT inside parentheses
    const lines: string[] = [];
    let currentLine = '';
    let lineParenDepth = 0;

    for (let i = 0; i < body.length; i++) {
      const char = body[i];
      if (char === '(') lineParenDepth++;
      else if (char === ')') lineParenDepth--;

      if (char === ',' && lineParenDepth === 0) {
        lines.push(currentLine.trim());
        currentLine = '';
      } else {
        currentLine += char;
      }
    }
    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }

    const tableLevelFks: { [col: string]: { table: string; column: string } } = {};

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      // Table-level PRIMARY KEY (col1, col2)
      const pkMatch = line.match(/^PRIMARY\s+KEY\s*\(([^)]+)\)/i);
      if (pkMatch) {
        const pks = pkMatch[1].split(',').map(s => s.trim().replace(/[`"']/g, ''));
        table.primaryKeys.push(...pks);
        continue;
      }

      // Table-level FOREIGN KEY (col) REFERENCES other_table(other_col)
      const fkMatch = line.match(/^(?:CONSTRAINT\s+[`"']?[a-zA-Z0-9_]+[`"']?\s+)?FOREIGN\s+KEY\s*\(([`"']?[a-zA-Z0-9_]+[`"']?)\)\s*REFERENCES\s+[`"']?([a-zA-Z0-9_]+)[`"']?\s*\(([`"']?[a-zA-Z0-9_]+[`"']?)\)/i);
      if (fkMatch) {
        const col = fkMatch[1].replace(/[`"']/g, '');
        tableLevelFks[col] = {
          table: fkMatch[2],
          column: fkMatch[3].replace(/[`"']/g, ''),
        };
        continue;
      }

      // Table-level UNIQUE (col) or CONSTRAINT ...
      if (/^(CONSTRAINT|UNIQUE|KEY|INDEX|CHECK)/i.test(line)) {
        continue;
      }

      // Column definition: col_name TYPE [CONSTRAINTS]
      const colMatch = line.match(/^[`"']?([a-zA-Z0-9_]+)[`"']?\s+([a-zA-Z0-9_]+(?:\s*\([^)]+\))?)(.*)$/i);
      if (!colMatch) continue;

      const colName = colMatch[1];
      const rawType = colMatch[2];
      const constraints = colMatch[3] || '';

      const normalizedType = normalizeSqlType(rawType);

      // Extract length or precision
      let length: number | undefined;
      let precision: number | undefined;
      let scale: number | undefined;
      const sizeMatch = rawType.match(/\((\d+)(?:,\s*(\d+))?\)/);
      if (sizeMatch) {
        if (sizeMatch[2]) {
          precision = parseInt(sizeMatch[1], 10);
          scale = parseInt(sizeMatch[2], 10);
        } else {
          length = parseInt(sizeMatch[1], 10);
        }
      }

      const isInlinePk = /PRIMARY\s+KEY/i.test(constraints);
      const isAutoIncrement = /AUTO_INCREMENT|SERIAL|IDENTITY/i.test(constraints) || /SERIAL/i.test(rawType);
      const isNotNull = /NOT\s+NULL/i.test(constraints);
      const isExplicitNull = /\bNULL\b/i.test(constraints) && !isNotNull;
      const isUnique = /\bUNIQUE\b/i.test(constraints);

      // Inline Default
      let defaultValue: string | undefined;
      const defaultMatch = constraints.match(/DEFAULT\s+([^, ]+)/i);
      if (defaultMatch) {
        defaultValue = defaultMatch[1].replace(/['"]/g, '');
      }

      // Inline References
      let foreignKey: { table: string; column: string } | undefined;
      const inlineFkMatch = constraints.match(/REFERENCES\s+[`"']?([a-zA-Z0-9_]+)[`"']?\s*\(([`"']?[a-zA-Z0-9_]+[`"']?)\)/i);
      if (inlineFkMatch) {
        foreignKey = {
          table: inlineFkMatch[1],
          column: inlineFkMatch[2].replace(/[`"']/g, ''),
        };
      }

      if (isInlinePk && !table.primaryKeys.includes(colName)) {
        table.primaryKeys.push(colName);
      }

      table.columns.push({
        name: colName,
        rawType,
        normalizedType,
        length,
        precision,
        scale,
        isPrimaryKey: isInlinePk,
        isAutoIncrement,
        isNullable: !isInlinePk && !isNotNull,
        isUnique,
        defaultValue,
        foreignKey,
      });
    }

    // Merge table-level primary keys and foreign keys
    for (const col of table.columns) {
      if (table.primaryKeys.includes(col.name)) {
        col.isPrimaryKey = true;
        col.isNullable = false;
      }
      if (tableLevelFks[col.name]) {
        col.foreignKey = tableLevelFks[col.name];
      }
    }

    tables.push(table);
  }

  return tables;
}

// ----------------------------------------------------
// Generators for Various ORMs
// ----------------------------------------------------

export function generatePrisma(tables: SqlTable[]): string {
  if (tables.length === 0) return '// No tables parsed from input SQL';

  const lines: string[] = [
    '// Prisma Schema generated from SQL',
    'generator client {',
    '  provider = "prisma-client-js"',
    '}',
    '',
    'datasource db {',
    '  provider = "postgresql"',
    '  url      = env("DATABASE_URL")',
    '}',
    '',
  ];

  for (const table of tables) {
    const modelName = toPascalCase(table.name);
    lines.push(`model ${modelName} {`);

    for (const col of table.columns) {
      const fieldName = toCamelCase(col.name);
      let prismaType = 'String';

      switch (col.normalizedType) {
        case 'int':
          prismaType = 'Int';
          break;
        case 'bigint':
          prismaType = 'BigInt';
          break;
        case 'float':
        case 'decimal':
          prismaType = col.normalizedType === 'decimal' ? 'Decimal' : 'Float';
          break;
        case 'boolean':
          prismaType = 'Boolean';
          break;
        case 'date':
        case 'datetime':
          prismaType = 'DateTime';
          break;
        case 'uuid':
          prismaType = 'String';
          break;
        case 'json':
          prismaType = 'Json';
          break;
        case 'binary':
          prismaType = 'Bytes';
          break;
        default:
          prismaType = 'String';
      }

      if (col.isNullable && !col.isPrimaryKey) {
        prismaType += '?';
      }

      const attributes: string[] = [];

      if (col.isPrimaryKey) {
        attributes.push('@id');
        if (col.isAutoIncrement) {
          attributes.push('@default(autoincrement())');
        } else if (col.normalizedType === 'uuid') {
          attributes.push('@default(uuid())');
        }
      }

      if (col.isUnique && !col.isPrimaryKey) {
        attributes.push('@unique');
      }

      if (col.defaultValue && !col.isPrimaryKey) {
        if (/now\(\)|current_timestamp/i.test(col.defaultValue)) {
          attributes.push('@default(now())');
        } else if (/true|false/i.test(col.defaultValue)) {
          attributes.push(`@default(${col.defaultValue.toLowerCase()})`);
        } else if (!isNaN(Number(col.defaultValue))) {
          attributes.push(`@default(${col.defaultValue})`);
        } else {
          attributes.push(`@default("${col.defaultValue}")`);
        }
      }

      if (fieldName !== col.name) {
        attributes.push(`@map("${col.name}")`);
      }

      const attrStr = attributes.length > 0 ? ' ' + attributes.join(' ') : '';
      lines.push(`  ${fieldName.padEnd(16)} ${prismaType.padEnd(12)}${attrStr}`);
    }

    if (toSnakeCase(modelName) !== table.name) {
      lines.push('');
      lines.push(`  @@map("${table.name}")`);
    }

    lines.push('}');
    lines.push('');
  }

  return lines.join('\n').trim();
}

export function generateSqlAlchemy(tables: SqlTable[]): string {
  if (tables.length === 0) return '# No tables parsed from input SQL';

  const lines: string[] = [
    '# SQLAlchemy 2.0 Models generated from SQL',
    'from datetime import datetime, date',
    'from typing import Optional, Any',
    'from sqlalchemy import String, Integer, BigInteger, Float, Numeric, Boolean, DateTime, Date, Text, ForeignKey',
    'from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship',
    '',
    'class Base(DeclarativeBase):',
    '    pass',
    '',
  ];

  for (const table of tables) {
    const className = toPascalCase(table.name);
    lines.push(`class ${className}(Base):`);
    lines.push(`    __tablename__ = "${table.name}"`);
    lines.push('');

    for (const col of table.columns) {
      let pyType = 'str';
      let sqlaType = 'String';

      switch (col.normalizedType) {
        case 'int':
          pyType = 'int';
          sqlaType = 'Integer';
          break;
        case 'bigint':
          pyType = 'int';
          sqlaType = 'BigInteger';
          break;
        case 'float':
          pyType = 'float';
          sqlaType = 'Float';
          break;
        case 'decimal':
          pyType = 'float';
          sqlaType = col.precision && col.scale ? `Numeric(${col.precision}, ${col.scale})` : 'Numeric';
          break;
        case 'boolean':
          pyType = 'bool';
          sqlaType = 'Boolean';
          break;
        case 'date':
          pyType = 'date';
          sqlaType = 'Date';
          break;
        case 'datetime':
          pyType = 'datetime';
          sqlaType = 'DateTime';
          break;
        case 'uuid':
          pyType = 'str';
          sqlaType = 'String(36)';
          break;
        case 'json':
          pyType = 'dict[str, Any]';
          sqlaType = 'Text';
          break;
        case 'text':
          pyType = 'str';
          sqlaType = 'Text';
          break;
        default:
          pyType = 'str';
          sqlaType = col.length ? `String(${col.length})` : 'String(255)';
      }

      const isOptional = col.isNullable && !col.isPrimaryKey;
      const typeAnnotation = isOptional ? `Optional[${pyType}]` : pyType;

      const columnArgs: string[] = [sqlaType];

      if (col.foreignKey) {
        columnArgs.push(`ForeignKey("${col.foreignKey.table}.${col.foreignKey.column}")`);
      }

      if (col.isPrimaryKey) {
        columnArgs.push('primary_key=True');
        if (col.isAutoIncrement) {
          columnArgs.push('autoincrement=True');
        }
      }

      if (col.isUnique && !col.isPrimaryKey) {
        columnArgs.push('unique=True');
      }

      if (!col.isNullable && !col.isPrimaryKey) {
        columnArgs.push('nullable=False');
      }

      if (col.defaultValue) {
        if (/now\(\)|current_timestamp/i.test(col.defaultValue)) {
          columnArgs.push('default=datetime.utcnow');
        } else if (/true|false/i.test(col.defaultValue)) {
          columnArgs.push(`default=${col.defaultValue.toLowerCase() === 'true' ? 'True' : 'False'}`);
        } else {
          columnArgs.push(`default=${col.defaultValue}`);
        }
      }

      lines.push(`    ${toSnakeCase(col.name)}: Mapped[${typeAnnotation}] = mapped_column(${columnArgs.join(', ')})`);
    }

    lines.push('');
  }

  return lines.join('\n').trim();
}

export function generateDrizzle(tables: SqlTable[]): string {
  if (tables.length === 0) return '// No tables parsed from input SQL';

  const lines: string[] = [
    '// Drizzle ORM Schema generated from SQL (PostgreSQL dialect)',
    "import { pgTable, serial, integer, bigint, varchar, text, boolean, timestamp, date, uuid, numeric, doublePrecision } from 'drizzle-orm/pg-core';",
    '',
  ];

  for (const table of tables) {
    const varName = toCamelCase(table.name);
    lines.push(`export const ${varName} = pgTable('${table.name}', {`);

    for (const col of table.columns) {
      const fieldName = toCamelCase(col.name);
      let colDef = '';

      if (col.isPrimaryKey && col.isAutoIncrement) {
        colDef = `serial('${col.name}').primaryKey()`;
      } else {
        switch (col.normalizedType) {
          case 'int':
            colDef = `integer('${col.name}')`;
            break;
          case 'bigint':
            colDef = `bigint('${col.name}', { mode: 'number' })`;
            break;
          case 'float':
            colDef = `doublePrecision('${col.name}')`;
            break;
          case 'decimal':
            colDef = `numeric('${col.name}'${col.precision ? `, { precision: ${col.precision}, scale: ${col.scale || 0} }` : ''})`;
            break;
          case 'boolean':
            colDef = `boolean('${col.name}')`;
            break;
          case 'date':
            colDef = `date('${col.name}')`;
            break;
          case 'datetime':
            colDef = `timestamp('${col.name}')`;
            break;
          case 'uuid':
            colDef = `uuid('${col.name}')`;
            break;
          case 'text':
          case 'json':
            colDef = `text('${col.name}')`;
            break;
          default:
            colDef = col.length ? `varchar('${col.name}', { length: ${col.length} })` : `varchar('${col.name}', { length: 255 })`;
        }

        if (col.isPrimaryKey) {
          colDef += '.primaryKey()';
        }

        if (!col.isNullable && !col.isPrimaryKey) {
          colDef += '.notNull()';
        }

        if (col.isUnique && !col.isPrimaryKey) {
          colDef += '.unique()';
        }

        if (col.defaultValue) {
          if (/now\(\)|current_timestamp/i.test(col.defaultValue)) {
            colDef += '.defaultNow()';
          } else if (/true|false/i.test(col.defaultValue)) {
            colDef += `.default(${col.defaultValue.toLowerCase()})`;
          } else if (!isNaN(Number(col.defaultValue))) {
            colDef += `.default(${col.defaultValue})`;
          } else {
            colDef += `.default('${col.defaultValue}')`;
          }
        }
      }

      lines.push(`  ${fieldName}: ${colDef},`);
    }

    lines.push('});');
    lines.push('');
  }

  return lines.join('\n').trim();
}

export function generateTypeOrm(tables: SqlTable[]): string {
  if (tables.length === 0) return '// No tables parsed from input SQL';

  const lines: string[] = [
    '// TypeORM Entities generated from SQL',
    "import { Entity, PrimaryGeneratedColumn, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';",
    '',
  ];

  for (const table of tables) {
    const className = toPascalCase(table.name);
    lines.push(`@Entity('${table.name}')`);
    lines.push(`export class ${className} {`);

    for (const col of table.columns) {
      const fieldName = toCamelCase(col.name);
      let tsType = 'string';

      switch (col.normalizedType) {
        case 'int':
        case 'bigint':
        case 'float':
        case 'decimal':
          tsType = 'number';
          break;
        case 'boolean':
          tsType = 'boolean';
          break;
        case 'date':
        case 'datetime':
          tsType = 'Date';
          break;
        case 'json':
          tsType = 'Record<string, any>';
          break;
        default:
          tsType = 'string';
      }

      if (col.isPrimaryKey && col.isAutoIncrement) {
        lines.push('  @PrimaryGeneratedColumn()');
      } else if (col.isPrimaryKey) {
        lines.push('  @PrimaryColumn()');
      } else if (/now\(\)|current_timestamp/i.test(col.defaultValue || '')) {
        lines.push('  @CreateDateColumn()');
      } else {
        const opts: string[] = [];
        if (col.name !== fieldName) opts.push(`name: '${col.name}'`);
        if (col.isNullable) opts.push('nullable: true');
        if (col.isUnique) opts.push('unique: true');
        if (col.length) opts.push(`length: ${col.length}`);

        const optsStr = opts.length > 0 ? `{ ${opts.join(', ')} }` : '';
        lines.push(`  @Column(${optsStr})`);
      }

      const nullableMarker = col.isNullable && !col.isPrimaryKey ? '?' : '';
      lines.push(`  ${fieldName}${nullableMarker}: ${tsType};`);
      lines.push('');
    }

    lines.push('}');
    lines.push('');
  }

  return lines.join('\n').trim();
}

export function generateGorm(tables: SqlTable[]): string {
  if (tables.length === 0) return '// No tables parsed from input SQL';

  const lines: string[] = [
    'package models',
    '',
    'import (',
    '    "time"',
    ')',
    '',
  ];

  for (const table of tables) {
    const structName = toPascalCase(table.name);
    lines.push(`type ${structName} struct {`);

    for (const col of table.columns) {
      const fieldName = toPascalCase(col.name);
      let goType = 'string';

      switch (col.normalizedType) {
        case 'int':
          goType = 'int';
          break;
        case 'bigint':
          goType = 'int64';
          break;
        case 'float':
        case 'decimal':
          goType = 'float64';
          break;
        case 'boolean':
          goType = 'bool';
          break;
        case 'date':
        case 'datetime':
          goType = 'time.Time';
          break;
        case 'binary':
          goType = '[]byte';
          break;
        default:
          goType = 'string';
      }

      if (col.isNullable && !col.isPrimaryKey) {
        goType = `*${goType}`;
      }

      const gormTags: string[] = [`column:${col.name}`];
      if (col.isPrimaryKey) gormTags.push('primaryKey');
      if (col.isAutoIncrement) gormTags.push('autoIncrement');
      if (!col.isNullable && !col.isPrimaryKey) gormTags.push('not null');
      if (col.isUnique && !col.isPrimaryKey) gormTags.push('unique');

      const jsonTag = toCamelCase(col.name) + (col.isNullable ? ',omitempty' : '');
      const tagStr = `\`gorm:"${gormTags.join(';')}" json:"${jsonTag}"\``;

      lines.push(`    ${fieldName.padEnd(16)} ${goType.padEnd(12)} ${tagStr}`);
    }

    lines.push('}');
    lines.push('');
  }

  return lines.join('\n').trim();
}

export function generateTypeScript(tables: SqlTable[]): string {
  if (tables.length === 0) return '// No tables parsed from input SQL';

  const lines: string[] = [
    '// TypeScript Interfaces generated from SQL',
    '',
  ];

  for (const table of tables) {
    const interfaceName = toPascalCase(table.name);
    lines.push(`export interface ${interfaceName} {`);

    for (const col of table.columns) {
      const fieldName = toCamelCase(col.name);
      let tsType = 'string';

      switch (col.normalizedType) {
        case 'int':
        case 'bigint':
        case 'float':
        case 'decimal':
          tsType = 'number';
          break;
        case 'boolean':
          tsType = 'boolean';
          break;
        case 'date':
        case 'datetime':
          tsType = 'Date | string';
          break;
        case 'json':
          tsType = 'Record<string, unknown>';
          break;
        case 'binary':
          tsType = 'Uint8Array';
          break;
        default:
          tsType = 'string';
      }

      const optional = col.isNullable && !col.isPrimaryKey ? '?' : '';
      const nullUnion = col.isNullable && !col.isPrimaryKey ? ' | null' : '';

      lines.push(`  ${fieldName}${optional}: ${tsType}${nullUnion};`);
    }

    lines.push('}');
    lines.push('');
  }

  return lines.join('\n').trim();
}

/**
 * Main dispatcher to convert SQL to target ORM
 */
export function convertSqlToOrm(sql: string, target: OrmTarget): string {
  const tables = parseSqlSchema(sql);
  switch (target) {
    case 'prisma':
      return generatePrisma(tables);
    case 'sqlalchemy':
      return generateSqlAlchemy(tables);
    case 'drizzle':
      return generateDrizzle(tables);
    case 'typeorm':
      return generateTypeOrm(tables);
    case 'gorm':
      return generateGorm(tables);
    case 'typescript':
      return generateTypeScript(tables);
    default:
      return '// Unsupported ORM target';
  }
}
