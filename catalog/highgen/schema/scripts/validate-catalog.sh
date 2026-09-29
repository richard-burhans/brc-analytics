#!/bin/bash

source ./catalog/highgen/schema/scripts/source-file-schema-names.sh

python3 -m catalog.py_package.catalog_build.schema_utils.validate_catalog "./catalog/highgen/source" "${SOURCE_FILE_SCHEMA_NAMES[@]}"
