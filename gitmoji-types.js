/**
 * Which conventional-commit type each gitmoji may carry — see
 * README.md#rules. Every code on gitmoji.dev appears exactly once;
 * a commit using one that does not is refused, naming the gap.
 *
 * @type {Record<string, string[]>} gitmoji code → allowed types
 */
export const GITMOJI_TYPES = {
  ':sparkles:': ['feat'],
  ':bug:': ['fix'],
  ':ambulance:': ['fix'],
  ':memo:': ['docs'],
  ':recycle:': ['refactor'],
  ':zap:': ['perf'],
  ':white_check_mark:': ['test'],
  ':rewind:': ['revert'],
  ':construction:': ['wip'],

  ':art:': ['refactor', 'style'],
  ':fire:': ['refactor', 'chore'],
  ':truck:': ['refactor'],
  ':building_construction:': ['refactor'],
  ':wastebasket:': ['refactor'],
  ':coffin:': ['refactor'],
  ':label:': ['refactor', 'feat'],

  ':rotating_light:': ['fix'],
  ':lock:': ['fix'],
  ':alien:': ['fix'],
  ':goal_net:': ['fix'],
  ':adhesive_bandage:': ['fix'],
  ':pencil2:': ['fix', 'docs'],

  ':boom:': ['feat'],
  ':globe_with_meridians:': ['feat'],
  ':speech_balloon:': ['feat'],
  ':children_crossing:': ['feat'],
  ':triangular_flag_on_post:': ['feat'],
  ':passport_control:': ['feat'],
  ':necktie:': ['feat'],
  ':stethoscope:': ['feat'],
  ':thread:': ['feat'],
  ':airplane:': ['feat'],
  ':egg:': ['feat'],
  ':mag:': ['feat'],
  ':chart_with_upwards_trend:': ['feat'],
  ':card_file_box:': ['feat', 'refactor'],
  ':wheelchair:': ['feat', 'fix'],
  ':iphone:': ['feat', 'fix'],
  ':safety_vest:': ['feat', 'fix'],

  ':lipstick:': ['style', 'feat'],
  ':dizzy:': ['style'],

  ':page_facing_up:': ['docs'],
  ':bulb:': ['docs'],
  ':busts_in_silhouette:': ['docs'],

  ':clown_face:': ['test'],
  ':camera_flash:': ['test'],
  ':test_tube:': ['test'],

  ':green_heart:': ['ci'],
  ':construction_worker:': ['ci'],

  ':arrow_up:': ['build'],
  ':arrow_down:': ['build'],
  ':pushpin:': ['build'],
  ':heavy_plus_sign:': ['build'],
  ':heavy_minus_sign:': ['build'],
  ':package:': ['build'],
  ':bricks:': ['build', 'ci'],

  ':wrench:': ['chore'],
  ':hammer:': ['chore'],
  ':rocket:': ['chore', 'ci'],
  ':tada:': ['chore'],
  ':bookmark:': ['chore'],
  ':closed_lock_with_key:': ['chore'],
  ':twisted_rightwards_arrows:': ['chore'],
  ':bento:': ['chore'],
  ':loud_sound:': ['chore'],
  ':mute:': ['chore'],
  ':see_no_evil:': ['chore'],
  ':seedling:': ['chore'],
  ':monocle_face:': ['chore'],
  ':technologist:': ['chore', 'feat'],
  ':money_with_wings:': ['chore'],

  ':poop:': ['wip'],
  ':beers:': ['wip'],
  ':alembic:': ['wip'],
}
