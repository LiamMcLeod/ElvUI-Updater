<?php 

include 'functions.php';

/* 
 *  ElvUI update script
 */

$wow_elvui_addons = array(
    'elvui' => array( 
        'name'          => 'ElvUI',
        'path'          => '\ElvUI',
        'current_ver'   =>  0,
        'url'           => 'https://www.tukui.org/download.php?ui=elvui',
        'query'         => 'version',
        'node_number'   => 1,
        'ver_pos'       => 0,
        'download_path' => "https://www.tukui.org/downloads/elvui-",
    ),
    'snl' => array( 
        'name'          => 'Shadow and Light',
        'id'            => 38,
        'path'          => '\ElvUI_SLE',
        'current_ver'   =>  0,
        'query'         => 'changelog',
        'node_number'   => 0,
        'ver_pos'       => 'v',
    ),
);

$alternativePath = null;
$wow_path = $alternativePath?$alternativePath:'C:\Program Files (x86)\World of Warcraft';
$addonsPath = $wow_path . '\_retail_\Interface\addons';
$tukui_addon_url = 'https://www.tukui.org/addons.php?id=';
$tukui_download_url = 'https://www.tukui.org/addons.php?download=';
    
foreach ($wow_elvui_addons as &$addon ) {
    $tukui = new DOMDocument();
    $internalErrors = libxml_use_internal_errors( true );
    if ( $addon['name'] === 'ElvUI' ) {
        $tukui->loadHTMLFile( $addon['url'] );
    } else {
        $tukui->loadHTMLFile( $tukui_addon_url . $addon['id'] );
    }
    
    libxml_use_internal_errors( $internalErrors );
    
    $version_id_content = $tukui->getElementById($addon['query'])->childNodes[$addon['node_number']]->nodeValue;
    if ( $addon['ver_pos'] === 0 ) {
        $latestVer = $version_id_content;
    } else {
        $latestVer = substr( $version_id_content, stripos( $version_id_content, 'v' ) + 1, 4 );
    }

    $addon_toc = null;

    if ( file_exists( $addonsPath . '\\' . $addon['path'] . $addon['path'] . '.toc' ) ) {
        $addon_toc = file( $addonsPath . '\\' . $addon['path'] . $addon['path'] . '.toc' );
    }

    if ( $addon_toc ) {
        foreach ($addon_toc as $row ) {
            if ( stripos( $row, 'Version' ) !== false ) {
                $row_array = explode( ' ', $row );
                $addon['current_ver'] = (float)end($row_array);
                break;
            }
        }
    }

    if ( $addon['current_ver'] === 0 ) {
        echo $addon['name'] . ' is not installed.<br>';
    } else {
        echo 'Currently installed version of ' . $addon['name'] . ': ' . $addon['current_ver'] . '<br>';
    }
    
    echo 'Latest Version of ' . $addon['name'] . ': ' . $latestVer . '<br>';
    
    $difference = $latestVer - $addon['current_ver'];
    
    if ($difference > 0) {
        if ( $addon['name'] === 'ElvUI' ) {
            $download_path = $addon['download_path'] . $latestVer . '.zip';
        } else {
            $download_path = $tukui_download_url . $addon['id'];
        }
        $zip_file = file_get_contents($download_path);
        $download_name = $addon['name'] === 'ElvUI' ? basename($download_path) : strtolower(implode('', explode( ' ', $addon['name']))) . '.zip';
        file_put_contents($addonsPath . '\\' . $download_name, $zip_file );
        $zip = new ZipArchive;
        $res = $zip->open($addonsPath . '\\' . $download_name);
        if ( $res === TRUE ) {
            $zip->extractTo($addonsPath);
            $zip->close();
            echo $addon['name'] . ' has been updated to the latest version.<br>';
        } else {
            echo 'There was an error opening ' . $download_name . '<br>';
        }
        unlink( $addonsPath . '\\' . $download_name );
    }
    echo '<hr><br>';
}