<?php
/**
 * Скопируйте в config.php на хостинге и задайте свой upload_token.
 */
return [
    'upload_token' => 'CHANGE_ME',
    'max_bytes' => 5 * 1024 * 1024,
    'upload_dir' => dirname(__DIR__) . '/uploads/gallery',
    'data_file' => dirname(__DIR__) . '/data/gallery.json',
];
