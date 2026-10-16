-- Nigdiz - Esquema MySQL para phpMyAdmin / Towebs
-- Convertido desde el esquema PostgreSQL/Supabase proporcionado.
-- Charset recomendado: utf8mb4
-- Motor: InnoDB

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET FOREIGN_KEY_CHECKS = 0;

-- =========================================================
-- TABLA: categorias
-- =========================================================
CREATE TABLE IF NOT EXISTS categorias (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY categorias_nombre_key (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- TABLA: clientes
-- =========================================================
CREATE TABLE IF NOT EXISTS clientes (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('cliente', 'admin') NOT NULL DEFAULT 'cliente',
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY clientes_email_key (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- TABLA: configuraciones
-- Nota: la RLS de Supabase/PostgreSQL no existe igual en MySQL.
-- La autorización debe controlarse desde el backend.
-- =========================================================
CREATE TABLE IF NOT EXISTS configuraciones (
    clave VARCHAR(100) NOT NULL,
    valor TEXT NOT NULL,
    PRIMARY KEY (clave)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- TABLA: productos
-- =========================================================
CREATE TABLE IF NOT EXISTS productos (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT NULL,
    precio DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    categoria VARCHAR(100) NOT NULL,
    imagen_url TEXT NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    destacado TINYINT(1) NOT NULL DEFAULT 0,
    orden INT NOT NULL DEFAULT 0,
    imagenes TEXT NULL,
    PRIMARY KEY (id),
    KEY idx_productos_categoria (categoria),
    CONSTRAINT fk_productos_categoria
        FOREIGN KEY (categoria)
        REFERENCES categorias(nombre)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- TABLA: ofertas
-- PostgreSQL jsonb -> MySQL JSON
-- =========================================================
CREATE TABLE IF NOT EXISTS ofertas (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    producto_ids JSON NULL,
    descuento_o_precio_paquete DECIMAL(10,2) NOT NULL,
    tipo_descuento ENUM('precio_paquete', 'porcentaje') NOT NULL DEFAULT 'precio_paquete',
    prioridad INT NOT NULL DEFAULT 0,
    activa TINYINT(1) NOT NULL DEFAULT 1,
    desactivada_por_stock TINYINT(1) NOT NULL DEFAULT 0,
    producto_sin_stock_id BIGINT NULL,
    producto_sin_stock_nombre VARCHAR(255) NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- TABLA: pedidos
-- PostgreSQL metodo_pago_enum -> MySQL ENUM
-- =========================================================
CREATE TABLE IF NOT EXISTS pedidos (
    id BIGINT NOT NULL AUTO_INCREMENT,
    cliente_id BIGINT NOT NULL,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2) NOT NULL,
    estado ENUM(
        'pendiente',
        'esperando_aprobacion',
        'pago_rechazado',
        'pago_vencido',
        'pago_aprobado_sin_stock',
        'enviado',
        'completado',
        'pendiente_pago',
        'aprobado'
    ) NOT NULL DEFAULT 'pendiente',
    metodo_pago ENUM('transferencia', 'efectivo', 'mercadopago') NOT NULL DEFAULT 'transferencia',
    recargo_aplicado DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    comprobante_url TEXT NULL,
    entrega_nombre VARCHAR(120) NULL,
    entrega_email VARCHAR(255) NULL,
    entrega_telefono VARCHAR(40) NULL,
    entrega_direccion VARCHAR(240) NULL,
    entrega_notas TEXT NULL,
    envio_destination_id INT NULL,
    envio_localidad VARCHAR(120) NULL,
    envio_provincia VARCHAR(120) NULL,
    envio_cp VARCHAR(20) NULL,
    envio_costo DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    mp_payment_id VARCHAR(80) NULL,
    mp_payment_status VARCHAR(40) NULL,
    mp_payment_status_detail VARCHAR(120) NULL,
    mp_merchant_order_id VARCHAR(120) NULL,
    mp_preference_id VARCHAR(120) NULL,
    mp_approved_at TIMESTAMP NULL DEFAULT NULL,
    mp_last_webhook_at TIMESTAMP NULL DEFAULT NULL,
    pago_rechazo_motivo TEXT NULL,
    stock_reservado_mp TINYINT(1) NOT NULL DEFAULT 0,
    reserva_stock_expira_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY pedidos_mp_payment_id_unique (mp_payment_id),
    KEY idx_pedidos_cliente_id (cliente_id),
    CONSTRAINT fk_pedidos_cliente
        FOREIGN KEY (cliente_id)
        REFERENCES clientes(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,
    CONSTRAINT chk_pedidos_recargo_no_negativo CHECK (recargo_aplicado >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- TABLA: mensajes
-- =========================================================
CREATE TABLE IF NOT EXISTS mensajes (
    id BIGINT NOT NULL AUTO_INCREMENT,
    pedido_id BIGINT NOT NULL,
    remitente ENUM('cliente', 'admin') NOT NULL,
    contenido TEXT NOT NULL,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    leido TINYINT(1) NOT NULL DEFAULT 0,
    hilo_id INT NOT NULL DEFAULT 1,
    tipo ENUM('mensaje', 'sistema') NOT NULL DEFAULT 'mensaje',
    cerrado TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    KEY idx_mensajes_pedido_id (pedido_id),
    CONSTRAINT fk_mensajes_pedido
        FOREIGN KEY (pedido_id)
        REFERENCES pedidos(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- TABLA: pedido_auditoria
-- PostgreSQL jsonb -> MySQL JSON
-- =========================================================
CREATE TABLE IF NOT EXISTS pedido_auditoria (
    id BIGINT NOT NULL AUTO_INCREMENT,
    pedido_id BIGINT NOT NULL,
    actor_id BIGINT NULL,
    actor_nombre VARCHAR(120) NULL,
    actor_email VARCHAR(255) NULL,
    accion VARCHAR(80) NOT NULL,
    estado_anterior VARCHAR(40) NULL,
    estado_nuevo VARCHAR(40) NULL,
    motivo TEXT NULL,
    detalles JSON NULL,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY pedido_auditoria_pedido_fecha_idx (pedido_id, fecha),
    CONSTRAINT pedido_auditoria_pedido_id_fkey
        FOREIGN KEY (pedido_id)
        REFERENCES pedidos(id)
        ON UPDATE RESTRICT
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- TABLA: pedido_items
-- Nota: el esquema PostgreSQL original NO definía FK para oferta_id.
-- Se conserva ese comportamiento.
-- =========================================================
CREATE TABLE IF NOT EXISTS pedido_items (
    id BIGINT NOT NULL AUTO_INCREMENT,
    pedido_id BIGINT NOT NULL,
    producto_id BIGINT NOT NULL,
    oferta_id BIGINT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_pedido_items_pedido_id (pedido_id),
    KEY idx_pedido_items_producto_id (producto_id),
    CONSTRAINT fk_pedido_items_pedido
        FOREIGN KEY (pedido_id)
        REFERENCES pedidos(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,
    CONSTRAINT fk_pedido_items_producto
        FOREIGN KEY (producto_id)
        REFERENCES productos(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
