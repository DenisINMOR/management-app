#!/usr/bin/env python3
"""
Скрипт для конвертации SVG иконки мишени в PNG файлы разных размеров
"""

from PIL import Image, ImageDraw
import os

def create_target_icon_png(size, output_path):
    """Создает PNG иконку мишени заданного размера"""
    
    # Создаем новое изображение с прозрачным фоном
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Вычисляем радиусы для каждого круга (пропорционально размеру)
    center = size // 2
    outer_radius = (size // 2) - 4
    ring_width = max(1, size // 32)  # Минимальная толщина кольца
    
    # Цвета
    black = (0, 0, 0, 255)
    azure = (0, 191, 255, 255)  # #00BFFF
    
    # Рисуем концентрические круги мишени
    radii = [outer_radius]
    colors = [black]  # Начинаем с черного
    
    # Добавляем остальные кольца
    current_radius = outer_radius - (ring_width * 2)
    is_black = False
    while current_radius > ring_width and len(radii) < 6:
        radii.append(current_radius)
        colors.append(azure if is_black else black)
        is_black = not is_black
        current_radius -= (ring_width * 3)
    
    # Рисуем круги
    for i, radius in enumerate(radii):
        if radius > 0:
            # Внешний круг
            draw.ellipse([
                center - radius, center - radius,
                center + radius, center + radius
            ], fill=colors[i])
    
    # Рисуем прицельные линии
    line_width = max(1, size // 64)
    cross_size = size // 5
    
    # Горизонтальная линия
    draw.rectangle([
        0, center - line_width // 2,
        size, center + line_width // 2
    ], fill=azure)
    
    # Вертикальная линия
    draw.rectangle([
        center - line_width // 2, 0,
        center + line_width // 2, size
    ], fill=azure)
    
    # Тонкие черные линии поверх для четкости
    thin_width = max(1, line_width // 2)
    
    draw.rectangle([
        0, center - thin_width // 2,
        size, center + thin_width // 2
    ], fill=black)
    
    draw.rectangle([
        center - thin_width // 2, 0,
        center + thin_width // 2, size
    ], fill=black)
    
    # Сохраняем как PNG
    img.save(output_path, 'PNG')
    print(f"Создан файл: {output_path} ({size}x{size})")

def main():
    """Основная функция для создания всех PNG иконок"""
    
    # Размеры иконок
    sizes = [16, 32, 64, 128, 256, 512]
    
    # Путь к выходной директории
    output_dir = "/workspace/learning-app/images"
    
    # Убеждаемся, что директория существует
    os.makedirs(output_dir, exist_ok=True)
    
    print("Создание PNG иконок мишени...")
    
    # Создаем иконки всех размеров
    for size in sizes:
        output_path = os.path.join(output_dir, f"target-icon-{size}x{size}.png")
        create_target_icon_png(size, output_path)
    
    print("\nВсе иконки успешно созданы!")
    
    # Показываем созданные файлы
    print("\nСозданные файлы:")
    for size in sizes:
        filename = f"target-icon-{size}x{size}.png"
        filepath = os.path.join(output_dir, filename)
        if os.path.exists(filepath):
            print(f"✓ {filename}")

if __name__ == "__main__":
    main()