import argparse
import json
import sys
from pathlib import Path

import nbformat
from jupyter_client import KernelManager
from jupyter_client.kernelspec import KernelSpecManager
from nbclient import NotebookClient


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    arguments = parser.parse_args()
    root = Path(__file__).resolve().parents[4]
    kernel = root / ".tmp/jupyter-kernels/flamengo-local"
    kernel.mkdir(parents=True, exist_ok=True)
    (kernel / "kernel.json").write_text(
        json.dumps(
            {
                "argv": [
                    sys.executable,
                    "-m",
                    "ipykernel_launcher",
                    "-f",
                    "{connection_file}",
                ],
                "display_name": "Flamengo Analytics local",
                "language": "python",
                "env": {"PYTHONUTF8": "1"},
            }
        ),
        encoding="utf-8",
    )
    completed = []
    for path in sorted((root / "notebooks").glob("*.ipynb")):
        notebook = nbformat.read(path, as_version=4)
        manager = KernelManager(
            ip="127.0.0.1",
            kernel_name="flamengo-local",
            kernel_spec_manager=KernelSpecManager(kernel_dirs=[str(kernel.parent)]),
        )
        client = NotebookClient(
            notebook,
            km=manager,
            timeout=60,
            resources={"metadata": {"path": str(root)}},
        )
        try:
            client.execute()
        finally:
            if manager.has_kernel:
                manager.shutdown_kernel(now=True)
        destination = (
            root / ".tmp/executed-notebooks" / path.name if arguments.check else path
        )
        destination.parent.mkdir(parents=True, exist_ok=True)
        nbformat.write(notebook, destination)
        completed.append(path.name)
    if len(completed) != 6:
        raise RuntimeError("EXPECTED_SIX_RESEARCH_NOTEBOOKS")
    print(
        json.dumps(
            {
                "notebooks_executed": completed,
                "analysis_unit": "club_match",
            }
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
