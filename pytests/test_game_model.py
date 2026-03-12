import unittest

from python_game import config
from python_game.entities import GameModel, Vec2, circles_overlap, Enemy, Projectile


class GameModelTests(unittest.TestCase):
    def test_shoot_creates_projectile(self):
        model = GameModel()
        model.shoot_at(100, 100)
        self.assertEqual(len(model.state.projectiles), 1)

    def test_projectile_enemy_collision_scores_points(self):
        model = GameModel()
        enemy = Enemy(position=Vec2(200, 200), velocity=Vec2(0, 0), health=1)
        model.state.enemies.append(enemy)
        model.state.projectiles.append(Projectile(position=Vec2(200, 200), velocity=Vec2(0, 0), damage=10))
        model._update_enemies(0.016)
        self.assertEqual(model.state.score, 10)
        self.assertEqual(len(model.state.enemies), 0)

    def test_player_bounds_clamped(self):
        model = GameModel()
        model.move_player(-100, -100, 1.0)
        self.assertGreaterEqual(model.state.player.position.x, 16)
        self.assertGreaterEqual(model.state.player.position.y, 16)

    def test_overlap_helper(self):
        self.assertTrue(circles_overlap(Vec2(0, 0), 4, Vec2(6, 0), 2))
        self.assertFalse(circles_overlap(Vec2(0, 0), 4, Vec2(7.1, 0), 2))


if __name__ == "__main__":
    unittest.main()
