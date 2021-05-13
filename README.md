# Releases to Changelog Action

Convert the list of releases to a changelog

## Inputs

### `title-template`

Configure the title of the release. Default: `%%TITLE%%`.

### `description-template`

Configure the description of the release. Default: `%%DESCRIPTION%%`.

## Outputs

### `changelog`

The changelog that was generated.

### `latest`

The tag name of the latest release.

## Example usage

```
-   name: Generate markdown changelog
    uses: LSVH/releases-to-changelog@v1
    with:
        title-template: '# %%TITLE%%'
```
