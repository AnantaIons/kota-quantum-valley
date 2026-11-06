"""Code check for a Course 3 chapter: every program on the page is built and every terminal session is replayed.

Usage: python3 content/programming/tools/run_chapter.py content/programming/chapters/KQV-PROG-C001

Rules (the chapter's Markdown is the single source of truth):
- A ```c or ```python block whose first line names a file ("// hello.c", "# hello.py") is written to a fresh folder.
  Every such C file must compile with gcc -std=c17 -Wall -Wextra -Werror, and every Python file must compile,
  unless its first line says "on purpose" (a deliberately broken example).
- A hidden line '<!-- file: name.c -->' just before a fence names a program whose first line cannot be a comment.
- A ```console block is replayed in that folder, in page order: each "$ command" line is run with bash, and its
  combined stdout and stderr must equal the lines that follow it. In expected output, a line that is exactly
  "..." matches any number of lines (including none), and "..." inside a line matches any text.
- Python runs with normal output buffering (PYTHONUNBUFFERED removed), as on a reader's machine.
Prints one PASS/FAIL line per check and exits non-zero on any failure.
"""
import os, re, sys, subprocess, tempfile, shutil

FENCE = re.compile(r'^(?:<!--\s*file:\s*([\w.-]+)\s*-->\n)?```([\w-]*)[^\n]*\n(.*?)^```\s*$', re.M | re.S)

def blocks(md):
    """(lang, code) pairs; a hidden '<!-- file: name -->' line just before a fence names a program whose first
    line cannot be a comment (for example a C/Python polyglot). It is stored as a first-line comment marker."""
    out = []
    for m in FENCE.finditer(md):
        name, lang, code = m.group(1), m.group(2), m.group(3)
        out.append((lang, code, name))
    return out

def filename(lang, code, hidden=None):
    if hidden:
        return (hidden, False)
    first = code.split('\n', 1)[0]
    m = (lang == 'c' and re.match(r'^//\s*([\w.-]+\.[ch])\b', first)) or (lang == 'python' and re.match(r'^#\s*([\w.-]+\.py)\b', first))
    return (m.group(1), 'on purpose' in first) if m else (None, False)

def line_match(pat, line):
    if '...' not in pat:
        return pat == line
    rx = '^' + '.*'.join(re.escape(p) for p in pat.split('...')) + '$'
    return re.match(rx, line) is not None

def lines_match(expected, actual):
    """Match with '...' lines as wildcards (greedy-safe recursive matcher)."""
    if not expected:
        return not actual
    if expected[0] == '...':
        return any(lines_match(expected[1:], actual[k:]) for k in range(len(actual) + 1))
    return bool(actual) and line_match(expected[0], actual[0]) and lines_match(expected[1:], actual[1:])

def parse_session(code):
    steps, cur = [], None
    for line in code.rstrip('\n').split('\n'):
        if line.startswith('$ '):
            cur = [line[2:], []]
            steps.append(cur)
        elif cur is not None:
            cur[1].append(line)
    return steps

def main(chdir):
    md = open(os.path.join(chdir, 'chapter.md'), encoding='utf-8').read()
    results = []
    work = tempfile.mkdtemp(prefix='kqv-prog-')
    env = {k: v for k, v in os.environ.items() if k != 'PYTHONUNBUFFERED'}
    env.update(LC_ALL='C.UTF-8', LANG='C.UTF-8', TERM='dumb')
    try:
        bl = blocks(md)
        files = []
        for lang, code, hidden in bl:
            if lang in ('c', 'python'):
                name, broken = filename(lang, code, hidden)
                if name:
                    files.append((lang, name, broken, code))
        names = [n for _, n, _, _ in files]
        dup = {n for n in names if names.count(n) > 1}
        results.append(('every program file name is used once' + (f' (repeated: {sorted(dup)})' if dup else ''), not dup))
        for lang, name, broken, code in files:
            open(os.path.join(work, name), 'w', encoding='utf-8').write(code)
        # Clean build of every program not marked as broken on purpose
        for lang, name, broken, code in files:
            if broken:
                continue
            if lang == 'c':
                r = subprocess.run(['gcc', '-std=c17', '-Wall', '-Wextra', '-Werror', '-c', '-o', '/dev/null', name], cwd=work, capture_output=True, text=True)
                results.append((f'{name} compiles with no warnings', r.returncode == 0 and not r.stderr.strip()))
                if r.returncode or r.stderr.strip():
                    print(r.stderr)
            else:
                r = subprocess.run([sys.executable, '-c', f'import ast,sys; ast.parse(open({name!r}).read())'], cwd=work, capture_output=True, text=True)
                results.append((f'{name} is valid Python', r.returncode == 0))
        # Replay terminal sessions in page order
        for lang, code, _ in bl:
            if lang != 'console':
                continue
            for cmd, expected in parse_session(code):
                if cmd.startswith('sudo ') or cmd.startswith('pkg ') or cmd.startswith('pacman ') or cmd.startswith('wsl '):
                    continue   # installation commands are not replayed
                r = subprocess.run(['bash', '-c', cmd], cwd=work, capture_output=True, text=True, env=env, timeout=120)
                out = (r.stdout + r.stderr).rstrip('\n')
                actual = [l.rstrip() for l in out.split('\n')] if out else []
                ok = lines_match([l.rstrip() for l in expected], actual)
                results.append((f'$ {cmd}', ok))
                if not ok:
                    print(f'--- $ {cmd}\n--- expected:\n' + '\n'.join(expected) + '\n--- actual:\n' + '\n'.join(actual) + '\n---')
    finally:
        shutil.rmtree(work, ignore_errors=True)
    for name, ok in results:
        print(f"{'PASS' if ok else 'FAIL'}  {name}")
    fails = sum(not ok for _, ok in results)
    print(f'\n{len(results) - fails} of {len(results)} checks passed')
    return 1 if fails else 0

if __name__ == '__main__':
    sys.exit(main(sys.argv[1]))
