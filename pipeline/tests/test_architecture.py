import ast
import io
import json
import tokenize
from dataclasses import asdict
from pathlib import Path

from flamengo_pipeline.domain.models import ANALYTICS_SCOPE

PROJECT_ROOT = Path(__file__).resolve().parents[2]
SOURCE_ROOT = PROJECT_ROOT / "pipeline/src/flamengo_pipeline"


def test_python_scope_matches_the_cross_language_contract():
    document = json.loads((PROJECT_ROOT / "contracts/scope.json").read_text())
    assert asdict(ANALYTICS_SCOPE) == document


def test_python_dependencies_point_inwards():
    allowed_standard = {
        "ast",
        "collections",
        "dataclasses",
        "datetime",
        "math",
        "typing",
        "uuid",
    }
    for layer in ("domain", "application", "adapters"):
        for path in (SOURCE_ROOT / layer).glob("*.py"):
            tree = ast.parse(path.read_text(encoding="utf-8"))
            for node in ast.walk(tree):
                if isinstance(node, ast.ImportFrom):
                    modules = [node.module]
                elif isinstance(node, ast.Import):
                    modules = [alias.name for alias in node.names]
                else:
                    continue
                for module in modules:
                    if module.startswith("flamengo_pipeline."):
                        target = module.split(".")[1]
                        allowed = {
                            "domain": {"domain"},
                            "application": {"application", "domain"},
                            "adapters": {"application", "domain"},
                        }[layer]
                        assert target in allowed, (path, module)
                    elif layer != "adapters":
                        assert module.split(".")[0] in allowed_standard, (path, module)


def test_python_code_has_no_comments_or_docstrings():
    for path in (PROJECT_ROOT / "pipeline").rglob("*.py"):
        if "__pycache__" in path.parts:
            continue
        text = path.read_text(encoding="utf-8")
        tokens = tokenize.generate_tokens(io.StringIO(text).readline)
        assert not any(token.type == tokenize.COMMENT for token in tokens), path
        tree = ast.parse(text)
        for node in ast.walk(tree):
            if isinstance(
                node, (ast.Module, ast.ClassDef, ast.FunctionDef, ast.AsyncFunctionDef)
            ):
                assert ast.get_docstring(node) is None, path
