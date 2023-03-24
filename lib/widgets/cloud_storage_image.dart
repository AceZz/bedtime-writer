import 'package:flutter/material.dart';

import '../backend.dart';

/// Returns a future that resolves to the image at [path].
Future<ImageProvider> getCloudStorageImage(String path) async {
  return storage.ref().child(path).getData().then((bytes) {
    if (bytes == null) {
      throw FormatException('Could not download storage image at $path.');
    }
    return Image.memory(bytes).image;
  });
}
