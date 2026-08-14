#!/usr/bin/env sh

set -eu

html_files=$(find . -maxdepth 1 -type f -name '*.html' -print | sort)

if [ -z "$html_files" ]; then
  echo "No root-level HTML files found." >&2
  exit 1
fi

failed=0

check() {
  description=$1
  pattern=$2

  matches=$(grep -Eni "$pattern" $html_files || true)
  if [ -n "$matches" ]; then
    echo "ERROR: $description" >&2
    echo "$matches" >&2
    failed=1
  fi
}

# Forms must use same-origin relative paths. This prevents shopper data from
# being posted to a host that BelleShop does not control.
check "form actions must not use absolute HTTP(S) URLs" \
  "<form[^>]*action[[:space:]]*=[[:space:]]*['\"]https?://"

# The original template sent forms and storefront navigation to this vendor.
check "template-vendor links are not allowed" \
  'annimexweb\.com'

# Plain HTTP resources cause mixed-content failures and can be modified in
# transit. Use HTTPS or a local path instead.
check "plain HTTP URLs are not allowed" \
  'http://'

if [ "$failed" -ne 0 ]; then
  exit 1
fi

echo "Endpoint safety check passed."
