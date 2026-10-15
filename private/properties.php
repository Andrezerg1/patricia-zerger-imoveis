<?php
declare(strict_types=1);

function validate_property(array $input, array $rows): array {
    $id = $input['id'] ?? '';
    if (!is_string($id) || !preg_match('/^PZ-[A-Z0-9]{3,24}$/D', $id)) {
        throw new InvalidArgumentException('Código de imóvel inválido.');
    }
    $existing = null;
    foreach ($rows as $row) if ($row['id'] === $id) $existing = $row;
    if (!$existing && count($rows) >= 100) throw new InvalidArgumentException('O catálogo permite até 100 imóveis.');
    $entry = ['id' => $id];
    foreach (['title'=>90, 'neighborhood'=>60, 'street'=>100, 'description'=>3000] as $key => $max) {
        $value = $input[$key] ?? null;
        if (!is_string($value) || trim($value) === '' || preg_match_all('/./us', $value) > $max) {
            throw new InvalidArgumentException('Verifique os campos obrigatórios e seus limites de texto.');
        }
        $entry[$key] = trim($value);
    }
    foreach (['type'=>['Casa','Apartamento','Terreno'], 'status'=>['published','draft']] as $key => $values) {
        if (!in_array($input[$key] ?? null, $values, true)) throw new InvalidArgumentException('Tipo ou status inválido.');
        $entry[$key] = $input[$key];
    }
    foreach (['price'=>[1,999999999], 'area'=>[1,1000000], 'beds'=>[0,100], 'baths'=>[0,100], 'parking'=>[0,100]] as $key => [$min,$max]) {
        $value = $input[$key] ?? null;
        if ((!is_int($value) && !is_float($value)) || !is_finite((float)$value) || $value < $min || $value > $max || (in_array($key, ['beds','baths','parking']) && floor($value) != $value)) {
            throw new InvalidArgumentException('Verifique os valores numéricos do imóvel.');
        }
        $entry[$key] = $value;
    }
    if (!is_bool($input['featured'] ?? null)) throw new InvalidArgumentException('Destaque inválido.');
    $entry['featured'] = $input['featured'];
    $photos = $input['photos'] ?? null;
    if (!is_array($photos) || !array_is_list($photos) || count($photos) < 1 || count($photos) > 8) {
        throw new InvalidArgumentException('Adicione entre 1 e 8 fotos.');
    }
    $validated = [];
    foreach ($photos as $photo) {
        if (!is_string($photo)) throw new InvalidArgumentException('Foto inválida.');
        if (in_array($photo, $existing['photos'] ?? [], true)) { $validated[] = ['path'=>$photo]; continue; }
        if (!preg_match('#^data:image/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$#D', $photo, $match)) {
            throw new InvalidArgumentException('Envie uma foto JPG, PNG ou WebP válida.');
        }
        $binary = base64_decode($match[2], true);
        if ($binary === false || strlen($binary) > 1536 * 1024) throw new InvalidArgumentException('Uma foto ficou muito grande. Use uma imagem menor.');
        $size = @getimagesizefromstring($binary);
        if (!$size || $size['mime'] !== 'image/' . $match[1] || max($size[0], $size[1]) > 1600 || min($size[0], $size[1]) < 1) {
            throw new InvalidArgumentException('Imagem inválida ou maior que 1600 pixels.');
        }
        $ext = $match[1] === 'jpeg' ? 'jpg' : $match[1];
        $validated[] = ['path'=>'uploads/' . hash('sha256', $binary) . '.' . $ext, 'binary'=>$binary];
    }
    $uploadDir = PUBLIC_ROOT . '/uploads';
    if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) throw new RuntimeException('Pasta de fotos indisponível.');
    foreach ($validated as $photo) {
        if (isset($photo['binary'])) {
            $target = PUBLIC_ROOT . '/' . $photo['path'];
            if (!is_file($target) && file_put_contents($target, $photo['binary'], LOCK_EX) === false) {
                throw new RuntimeException('Não foi possível salvar a foto.');
            }
        }
    }
    $entry['photos'] = array_column($validated, 'path');
    return $entry;
}

function remove_unused_photos(array $rows): void {
    $used = [];
    foreach ($rows as $row) foreach ($row['photos'] as $photo) $used[$photo] = true;
    foreach (glob(PUBLIC_ROOT . '/uploads/*') ?: [] as $file) {
        $name = basename($file);
        if (preg_match('/^[a-f0-9]{64}\.(jpg|png|webp)$/D', $name) && !isset($used['uploads/' . $name])) @unlink($file);
    }
}
