"""Pygame runtime and rendering for Skyline Survivors standalone edition."""

from __future__ import annotations

import pygame

from . import config
from .entities import GameModel


def run() -> None:
    pygame.init()
    screen = pygame.display.set_mode((config.WIDTH, config.HEIGHT))
    pygame.display.set_caption("Skyline Survivors - Python Edition")
    clock = pygame.time.Clock()
    font = pygame.font.SysFont("consolas", 20)
    model = GameModel()

    running = True
    while running:
        dt = clock.tick(config.FPS) / 1000.0
        move_x = 0.0
        move_y = 0.0

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE:
                running = False
            elif event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
                x, y = pygame.mouse.get_pos()
                model.shoot_at(x, y)

        keys = pygame.key.get_pressed()
        if keys[pygame.K_a] or keys[pygame.K_LEFT]:
            move_x -= 1
        if keys[pygame.K_d] or keys[pygame.K_RIGHT]:
            move_x += 1
        if keys[pygame.K_w] or keys[pygame.K_UP]:
            move_y -= 1
        if keys[pygame.K_s] or keys[pygame.K_DOWN]:
            move_y += 1

        model.move_player(move_x, move_y, dt)
        model.update(dt)

        screen.fill(config.BACKGROUND_COLOR)
        _draw_entities(screen, model)
        _draw_hud(screen, font, model)
        pygame.display.flip()

    pygame.quit()


def _draw_entities(screen: pygame.Surface, model: GameModel) -> None:
    state = model.state
    pygame.draw.circle(
        screen,
        config.PLAYER_COLOR,
        (int(state.player.position.x), int(state.player.position.y)),
        int(state.player.radius),
    )

    for enemy in state.enemies:
        pygame.draw.circle(
            screen,
            config.ENEMY_COLOR,
            (int(enemy.position.x), int(enemy.position.y)),
            int(enemy.radius),
        )

    for projectile in state.projectiles:
        pygame.draw.circle(
            screen,
            config.PROJECTILE_COLOR,
            (int(projectile.position.x), int(projectile.position.y)),
            int(projectile.radius),
        )

    for powerup in state.powerups:
        pygame.draw.circle(
            screen,
            config.POWERUP_COLOR,
            (int(powerup.position.x), int(powerup.position.y)),
            int(powerup.radius),
            width=3,
        )


def _draw_hud(screen: pygame.Surface, font: pygame.font.Font, model: GameModel) -> None:
    state = model.state
    text = f"HP: {state.player.health}    Score: {state.score}    Wave: {state.wave}"
    surface = font.render(text, True, config.HUD_COLOR)
    screen.blit(surface, (16, 16))

    if state.game_over:
        over = font.render("GAME OVER - Press ESC to quit", True, config.ENEMY_COLOR)
        screen.blit(over, (config.WIDTH // 2 - over.get_width() // 2, config.HEIGHT // 2))
