import re

# Ler arquivo SQL do backup
with open('backup.sql', 'r', encoding='utf-8') as f:
    sql_content = f.read()

# Extrair VALUES do SQL
pattern = r"VALUES\s*\((.*?)\)(?:,\s*\(|;)"
matches = re.findall(pattern, sql_content, re.DOTALL)

print(f"📊 Total de registros encontrados: {len(matches)}\n")

# Mostrar os primeiros 3 registros
for i, match in enumerate(matches[:3], 1):
    print(f"{'=' * 80}")
    print(f"REGISTRO {i}:")
    print(f"{'=' * 80}")
    print(match[:500])  # Primeiros 500 caracteres
    print(f"\n")

    # Extrair valores
    value_pattern = r"'((?:[^']|'')*)'|(\w+)"
    values = re.findall(value_pattern, match)

    print(f"Valores extraídos: {len(values)}")
    for j, (quoted, unquoted) in enumerate(values[:5], 1):
        if quoted:
            print(f"  {j}. '{quoted[:50]}'")
        else:
            print(f"  {j}. {unquoted}")
    print(f"\n")