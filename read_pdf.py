import argparse
from pypdf import PdfReader

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf_path")
    parser.add_argument("output_path")
    args = parser.parse_args()

    reader = PdfReader(args.pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"

    with open(args.output_path, "w", encoding="utf-8") as f:
        f.write(text)

if __name__ == "__main__":
    main()
