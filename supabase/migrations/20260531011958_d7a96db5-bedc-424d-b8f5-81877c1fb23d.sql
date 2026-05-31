DELETE FROM product_images WHERE product_id IN (SELECT id FROM products WHERE category_id='d5ce200a-cd25-4a93-8ec1-851dbaa9a41c');
DELETE FROM product_variants WHERE product_id IN (SELECT id FROM products WHERE category_id='d5ce200a-cd25-4a93-8ec1-851dbaa9a41c');
DELETE FROM cart_items WHERE product_id IN (SELECT id FROM products WHERE category_id='d5ce200a-cd25-4a93-8ec1-851dbaa9a41c');
DELETE FROM wishlist WHERE product_id IN (SELECT id FROM products WHERE category_id='d5ce200a-cd25-4a93-8ec1-851dbaa9a41c');
DELETE FROM reviews WHERE product_id IN (SELECT id FROM products WHERE category_id='d5ce200a-cd25-4a93-8ec1-851dbaa9a41c');
DELETE FROM products WHERE category_id='d5ce200a-cd25-4a93-8ec1-851dbaa9a41c';