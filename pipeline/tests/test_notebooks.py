import ast
import io
import json
import tokenize
from pathlib import Path


def test_six_research_notebooks_preserve_executed_honest_outputs_and_no_comments():
    paths = sorted((Path(__file__).resolve().parents[2] / "notebooks").glob("*.ipynb"))
    assert len(paths) == 6
    for path in paths:
        notebook = json.loads(path.read_text(encoding="utf-8"))
        code = [cell for cell in notebook["cells"] if cell["cell_type"] == "code"]
        assert code
        for cell in code:
            assert cell["execution_count"] is not None
            assert not any(
                output["output_type"] == "error" for output in cell["outputs"]
            )
            source = "".join(cell["source"])
            assert not any(
                token.type == tokenize.COMMENT
                for token in tokenize.generate_tokens(io.StringIO(source).readline)
            )
            tree = ast.parse(source)
            for node in ast.walk(tree):
                if isinstance(node, (ast.Module, ast.ClassDef, ast.FunctionDef)):
                    assert ast.get_docstring(node) is None
