#!/usr/bin/env python3
"""Fix Mojibake Khmer text in the MySQL database.

The data was inserted without setting utf8mb4 charset, causing Khmer UTF-8 bytes
to be treated as Windows-1252/latin-1 chars and re-encoded as UTF-8.

Fix: encode stored chars back as latin-1 bytes, then decode as UTF-8.
"""

import subprocess
import sys

def run_mysql(query, params=None):
    """Run a MySQL query in the Docker container."""
    cmd = [
        "docker", "exec", "taonaire_mysql",
        "mysql", "-u", "root", "-prayuchoengrayu", "tonaire_db",
        "--default-character-set=utf8mb4",
        "-e", query
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8')
    if result.returncode != 0:
        print(f"MySQL error: {result.stderr}")
    return result.stdout, result.stderr

def fix_mojibake(s):
    """Reverse the double-encoding: encode as latin-1 then decode as utf-8."""
    try:
        return s.encode('latin-1').decode('utf-8')
    except (UnicodeDecodeError, UnicodeEncodeError):
        # Already correct or not Khmer - leave unchanged
        return None

def is_ascii_or_correct(s):
    """Check if string is pure ASCII (no fix needed)."""
    try:
        s.encode('ascii')
        return True
    except UnicodeEncodeError:
        return False

def escape_mysql_string(s):
    """Escape a string for use in MySQL query."""
    return s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n').replace('\r', '\\r')

def fix_table(table, columns, id_col='id'):
    """Fix Mojibake in specified columns of a table."""
    print(f"\n--- Fixing table: {table} ---")

    # Get all rows
    cols_str = ', '.join([id_col] + columns)
    stdout, _ = run_mysql(f"SELECT {cols_str} FROM {table};")

    lines = stdout.strip().split('\n')
    if len(lines) < 2:
        print("  No rows found.")
        return

    # Skip header line
    fixed_count = 0
    for line in lines[1:]:
        parts = line.split('\t')
        if len(parts) < len(columns) + 1:
            continue

        row_id = parts[0].strip()

        for i, col in enumerate(columns):
            original = parts[i + 1].strip() if (i + 1) < len(parts) else ''

            if not original or original == 'NULL':
                continue

            # Skip if already ASCII (English text doesn't need fixing)
            if is_ascii_or_correct(original):
                print(f"  [{table}.{col} id={row_id}] Already correct ASCII: {original[:50]}")
                continue

            fixed = fix_mojibake(original)
            if fixed is None:
                print(f"  [{table}.{col} id={row_id}] Could not fix, skipping.")
                continue

            if fixed == original:
                print(f"  [{table}.{col} id={row_id}] No change needed.")
                continue

            print(f"  [{table}.{col} id={row_id}]")
            print(f"    Before: {original[:60]}")
            print(f"    After:  {fixed[:60]}")

            escaped = escape_mysql_string(fixed)
            update_query = f"UPDATE {table} SET {col} = '{escaped}' WHERE {id_col} = {row_id};"
            _, err = run_mysql(update_query)
            if err and 'Warning' not in err:
                print(f"    ERROR: {err}")
            else:
                fixed_count += 1

    print(f"  Fixed {fixed_count} values in {table}.{col if columns else ''}")

def main():
    print("=== Khmer Mojibake Fix ===")
    print("Connecting to MySQL in Docker...")

    # Test connection
    stdout, stderr = run_mysql("SELECT VERSION();")
    if 'ERROR' in stderr:
        print(f"Connection failed: {stderr}")
        sys.exit(1)
    print(f"Connected. MySQL {stdout.strip().split(chr(10))[-1]}")

    # Fix Categories table
    fix_table('Categories', ['name', 'description'])

    # Fix Products table
    fix_table('Products', ['name', 'description'])

    print("\n=== Verification ===")
    stdout, _ = run_mysql("SELECT id, name FROM Categories;")
    print("Categories:")
    print(stdout)

    stdout, _ = run_mysql("SELECT id, name FROM Products WHERE category_id IN (2,4,6,8,10) LIMIT 10;")
    print("Khmer Products:")
    print(stdout)

if __name__ == '__main__':
    main()
