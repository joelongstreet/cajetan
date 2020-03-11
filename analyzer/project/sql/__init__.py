import pkg_resources


def file(fileName):
    return pkg_resources.resource_string(__name__, fileName + ".sql")
