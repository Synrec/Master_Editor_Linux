/*:
 * @authoor Synrec/Kylestclr
 * @plugindesc v1.0 A plugin to call a stats window when actor levels
 * @target MZ
 * 
 * @command Open Stat Allocation
 * @desc Opens the stat allocation scene
 * Use PageUp/PageDown to toggle actors
 * 
 * 
 * @help
 * Setup the actor configurations for stat points per level.
 * The level stats will apply to the base actor params
 * These base params are: 
 * - ATK
 * - DEF
 * - MAT
 * - MDF
 * - AGI
 * - LUK
 * 
 * The stat allocation scene can be called by script call:
 * SceneManager.push(SceneSynrec_StatAllocation)
 * 
 * As well as by plugin command (MZ)
 * 
 * @param Actor Configurations
 * @desc Setup actor level up stats
 * @type struct<actorConfig>[]
 * @default ["{\"Name\":\"Reid\",\"Actor\":\"1\",\"Stats Per Level\":\"1\",\"Base Param Growth\":\"[\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"MHP\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"10\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"MMP\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"10\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"ATK\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"2\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"DEF\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"3\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"MAT\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"4\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"MDF\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"5\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"AGI\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"6\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"LUK\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"7\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\"]\"}","{\"Name\":\"Priscilla\",\"Actor\":\"2\",\"Stats Per Level\":\"1\",\"Base Param Growth\":\"[\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"MHP\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"10\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"MMP\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"10\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"ATK\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"2\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"DEF\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"3\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"MAT\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"4\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"MDF\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"5\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"AGI\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"6\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"LUK\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"7\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\"]\"}","{\"Name\":\"Gale\",\"Actor\":\"3\",\"Stats Per Level\":\"1\",\"Base Param Growth\":\"[\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"MHP\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"10\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"MMP\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"10\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"ATK\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"2\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"DEF\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"3\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"MAT\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"4\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"MDF\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"5\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"AGI\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"6\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"LUK\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"7\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\"]\"}","{\"Name\":\"Michelle\",\"Actor\":\"4\",\"Stats Per Level\":\"1\",\"Base Param Growth\":\"[\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"MHP\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"10\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"MMP\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"10\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"ATK\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"2\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"DEF\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"3\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"MAT\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"4\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"MDF\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"5\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"AGI\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"6\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"LUK\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"7\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\"]\"}","{\"Name\":\"Albert\",\"Actor\":\"5\",\"Stats Per Level\":\"1\",\"Base Param Growth\":\"[\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"MHP\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"10\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"MMP\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"10\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"ATK\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"2\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"DEF\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"3\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"MAT\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"4\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"MDF\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"5\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"AGI\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"6\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"LUK\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"7\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\"]\"}","{\"Name\":\"Kasey\",\"Actor\":\"6\",\"Stats Per Level\":\"1\",\"Base Param Growth\":\"[\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"MHP\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"10\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"MMP\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"10\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"ATK\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"2\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"DEF\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"3\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"MAT\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"4\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"MDF\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"5\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"AGI\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"6\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"LUK\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"7\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\"]\"}","{\"Name\":\"Eliot\",\"Actor\":\"7\",\"Stats Per Level\":\"1\",\"Base Param Growth\":\"[\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"MHP\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"10\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"MMP\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"10\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"ATK\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"2\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"DEF\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"3\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"MAT\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"4\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"MDF\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"5\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"AGI\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"6\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"LUK\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"7\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\"]\"}","{\"Name\":\"Roza\",\"Actor\":\"8\",\"Stats Per Level\":\"1\",\"Base Param Growth\":\"[\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"MHP\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"10\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"MMP\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"10\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"ATK\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"2\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"DEF\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"3\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"MAT\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"4\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"MDF\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"5\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"AGI\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"6\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"LUK\\\\\\\",\\\\\\\"Parameter\\\\\\\":\\\\\\\"7\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\"]\"}"]
 * 
 * @param Actor Data Windows
 * @desc Data windows shown during stat allocation
 * @type struct<actorDataWindow>[]
 * @default ["{\"Name\":\"Character\",\"Dimension Configuration\":\"{\\\"X\\\":\\\"0\\\",\\\"Y\\\":\\\"0\\\",\\\"Width\\\":\\\"192\\\",\\\"Height\\\":\\\"192\\\"}\",\"Window Font and Style Configuration\":\"{\\\"Font Settings\\\":\\\"\\\",\\\"Font Size\\\":\\\"16\\\",\\\"Font Face\\\":\\\"sans-serif\\\",\\\"Base Font Color\\\":\\\"#ffffff\\\",\\\"Font Outline Color\\\":\\\"rgba(0, 0, 0, 0.5)\\\",\\\"Font Outline Thickness\\\":\\\"3\\\",\\\"Window Skin\\\":\\\"Window\\\",\\\"Window Opacity\\\":\\\"255\\\",\\\"Show Window Dimmer\\\":\\\"false\\\"}\",\"Draw Actor Name\":\"false\",\"Name X\":\"0\",\"Name Y\":\"0\",\"Draw Actor Character\":\"false\",\"Character X\":\"0\",\"Character Y\":\"0\",\"Character Direction\":\"2\",\"Draw Actor Face\":\"false\",\"Face X\":\"0\",\"Face Y\":\"0\",\"Face Width\":\"144\",\"Face Height\":\"144\",\"Draw Actor Battler\":\"true\",\"Battler X\":\"96\",\"Battler Y\":\"192\",\"Battler Scale X\":\"3.000\",\"Battler Scale Y\":\"3.000\",\"Battler Motion\":\"walk\",\"Draw Actor Profile\":\"false\",\"Profile X\":\"0\",\"Profile Y\":\"0\",\"Draw HP Resource\":\"false\",\"HP Text\":\"%1 / %2 (%3 %)\",\"HP X\":\"0\",\"HP Y\":\"0\",\"Draw MP Resource\":\"false\",\"MP Text\":\"%1 / %2 (%3 %)\",\"MP X\":\"0\",\"MP Y\":\"0\",\"Draw TP Resource\":\"false\",\"TP Text\":\"%1 / %2 (%3 %)\",\"TP X\":\"0\",\"TP Y\":\"0\",\"Draw Base Param\":\"[]\",\"Draw Ex Param\":\"[]\",\"Draw Sp Param\":\"[]\",\"Draw Actor States\":\"0\",\"State X\":\"0\",\"State Y\":\"0\",\"State Icon\":\"true\",\"State Name\":\"true\",\"Draw Equip Slots\":\"[]\",\"Draw Actor Class Level\":\"false\",\"Class Text\":\"Class: %1 <LV%2>\",\"Class X\":\"0\",\"Class Y\":\"0\"}","{\"Name\":\"Name\",\"Dimension Configuration\":\"{\\\"X\\\":\\\"192\\\",\\\"Y\\\":\\\"0\\\",\\\"Width\\\":\\\"Graphics.boxWidth - 192\\\",\\\"Height\\\":\\\"54\\\"}\",\"Window Font and Style Configuration\":\"{\\\"Font Settings\\\":\\\"\\\",\\\"Font Size\\\":\\\"24\\\",\\\"Font Face\\\":\\\"sans-serif\\\",\\\"Base Font Color\\\":\\\"#ffffff\\\",\\\"Font Outline Color\\\":\\\"rgba(0, 0, 0, 0.5)\\\",\\\"Font Outline Thickness\\\":\\\"3\\\",\\\"Window Skin\\\":\\\"Window\\\",\\\"Window Opacity\\\":\\\"255\\\",\\\"Show Window Dimmer\\\":\\\"false\\\"}\",\"Draw Actor Name\":\"true\",\"Name X\":\"148\",\"Name Y\":\"0\",\"Draw Actor Character\":\"false\",\"Character X\":\"0\",\"Character Y\":\"0\",\"Character Direction\":\"2\",\"Draw Actor Face\":\"true\",\"Face X\":\"0\",\"Face Y\":\"0\",\"Face Width\":\"144\",\"Face Height\":\"44\",\"Draw Actor Battler\":\"false\",\"Battler X\":\"0\",\"Battler Y\":\"0\",\"Battler Scale X\":\"1\",\"Battler Scale Y\":\"1\",\"Battler Motion\":\"none\",\"Draw Actor Profile\":\"false\",\"Profile X\":\"0\",\"Profile Y\":\"0\",\"Draw HP Resource\":\"false\",\"HP Text\":\"%1 / %2 (%3 %)\",\"HP X\":\"0\",\"HP Y\":\"0\",\"Draw MP Resource\":\"false\",\"MP Text\":\"%1 / %2 (%3 %)\",\"MP X\":\"0\",\"MP Y\":\"0\",\"Draw TP Resource\":\"false\",\"TP Text\":\"%1 / %2 (%3 %)\",\"TP X\":\"0\",\"TP Y\":\"0\",\"Draw Base Param\":\"[]\",\"Draw Ex Param\":\"[]\",\"Draw Sp Param\":\"[]\",\"Draw Actor States\":\"0\",\"State X\":\"0\",\"State Y\":\"0\",\"State Icon\":\"true\",\"State Name\":\"true\",\"Draw Equip Slots\":\"[]\",\"Draw Actor Class Level\":\"false\",\"Class Text\":\"Class: %1 <LV%2>\",\"Class X\":\"0\",\"Class Y\":\"0\"}","{\"Name\":\"Profile\",\"Dimension Configuration\":\"{\\\"X\\\":\\\"192\\\",\\\"Y\\\":\\\"54\\\",\\\"Width\\\":\\\"Graphics.boxWidth - 192\\\",\\\"Height\\\":\\\"138\\\"}\",\"Window Font and Style Configuration\":\"{\\\"Font Settings\\\":\\\"\\\",\\\"Font Size\\\":\\\"16\\\",\\\"Font Face\\\":\\\"sans-serif\\\",\\\"Base Font Color\\\":\\\"#ffffff\\\",\\\"Font Outline Color\\\":\\\"rgba(0, 0, 0, 0.5)\\\",\\\"Font Outline Thickness\\\":\\\"3\\\",\\\"Window Skin\\\":\\\"Window\\\",\\\"Window Opacity\\\":\\\"255\\\",\\\"Show Window Dimmer\\\":\\\"false\\\"}\",\"Draw Actor Name\":\"false\",\"Name X\":\"0\",\"Name Y\":\"0\",\"Draw Actor Character\":\"false\",\"Character X\":\"0\",\"Character Y\":\"0\",\"Character Direction\":\"2\",\"Draw Actor Face\":\"false\",\"Face X\":\"0\",\"Face Y\":\"0\",\"Face Width\":\"144\",\"Face Height\":\"144\",\"Draw Actor Battler\":\"false\",\"Battler X\":\"0\",\"Battler Y\":\"0\",\"Battler Scale X\":\"1\",\"Battler Scale Y\":\"1\",\"Battler Motion\":\"none\",\"Draw Actor Profile\":\"true\",\"Profile X\":\"0\",\"Profile Y\":\"0\",\"Draw HP Resource\":\"false\",\"HP Text\":\"%1 / %2 (%3 %)\",\"HP X\":\"0\",\"HP Y\":\"0\",\"Draw MP Resource\":\"false\",\"MP Text\":\"%1 / %2 (%3 %)\",\"MP X\":\"0\",\"MP Y\":\"0\",\"Draw TP Resource\":\"false\",\"TP Text\":\"%1 / %2 (%3 %)\",\"TP X\":\"0\",\"TP Y\":\"0\",\"Draw Base Param\":\"[]\",\"Draw Ex Param\":\"[]\",\"Draw Sp Param\":\"[]\",\"Draw Actor States\":\"0\",\"State X\":\"0\",\"State Y\":\"0\",\"State Icon\":\"true\",\"State Name\":\"true\",\"Draw Equip Slots\":\"[]\",\"Draw Actor Class Level\":\"false\",\"Class Text\":\"Class: %1 <LV%2>\",\"Class X\":\"0\",\"Class Y\":\"0\"}","{\"Name\":\"Points\",\"Dimension Configuration\":\"{\\\"X\\\":\\\"Graphics.boxWidth - 200\\\",\\\"Y\\\":\\\"Graphics.boxHeight - 166\\\",\\\"Width\\\":\\\"200\\\",\\\"Height\\\":\\\"54\\\"}\",\"Window Font and Style Configuration\":\"{\\\"Font Settings\\\":\\\"\\\",\\\"Font Size\\\":\\\"16\\\",\\\"Font Face\\\":\\\"sans-serif\\\",\\\"Base Font Color\\\":\\\"#ffffff\\\",\\\"Font Outline Color\\\":\\\"rgba(0, 0, 0, 0.5)\\\",\\\"Font Outline Thickness\\\":\\\"3\\\",\\\"Window Skin\\\":\\\"Window\\\",\\\"Window Opacity\\\":\\\"255\\\",\\\"Show Window Dimmer\\\":\\\"false\\\"}\",\"Draw Actor Name\":\"false\",\"Name X\":\"0\",\"Name Y\":\"0\",\"Draw Actor Points\":\"true\",\"Points Text\":\"Free Points: %1 / %2\",\"Points X\":\"0\",\"Points Y\":\"0\",\"Draw Actor Character\":\"false\",\"Character X\":\"0\",\"Character Y\":\"0\",\"Character Direction\":\"2\",\"Draw Actor Face\":\"false\",\"Face X\":\"0\",\"Face Y\":\"0\",\"Face Width\":\"144\",\"Face Height\":\"144\",\"Draw Actor Battler\":\"false\",\"Battler X\":\"0\",\"Battler Y\":\"0\",\"Battler Scale X\":\"1\",\"Battler Scale Y\":\"1\",\"Battler Motion\":\"none\",\"Draw Actor Profile\":\"false\",\"Profile X\":\"0\",\"Profile Y\":\"0\",\"Draw HP Resource\":\"false\",\"HP Text\":\"%1 / %2 (%3 %)\",\"HP X\":\"0\",\"HP Y\":\"0\",\"Draw MP Resource\":\"false\",\"MP Text\":\"%1 / %2 (%3 %)\",\"MP X\":\"0\",\"MP Y\":\"0\",\"Draw TP Resource\":\"false\",\"TP Text\":\"%1 / %2 (%3 %)\",\"TP X\":\"0\",\"TP Y\":\"0\",\"Draw Base Param\":\"[]\",\"Draw Ex Param\":\"[]\",\"Draw Sp Param\":\"[]\",\"Draw Actor States\":\"0\",\"State X\":\"0\",\"State Y\":\"0\",\"State Icon\":\"true\",\"State Name\":\"true\",\"Draw Equip Slots\":\"[]\",\"Draw Actor Class Level\":\"false\",\"Class Text\":\"Class: %1 <LV%2>\",\"Class X\":\"0\",\"Class Y\":\"0\"}","{\"Name\":\"HP\",\"Dimension Configuration\":\"{\\\"X\\\":\\\"0\\\",\\\"Y\\\":\\\"192\\\",\\\"Width\\\":\\\"Graphics.boxWidth * 0.5\\\",\\\"Height\\\":\\\"54\\\"}\",\"Window Font and Style Configuration\":\"{\\\"Font Settings\\\":\\\"\\\",\\\"Font Size\\\":\\\"24\\\",\\\"Font Face\\\":\\\"sans-serif\\\",\\\"Base Font Color\\\":\\\"#ffffff\\\",\\\"Font Outline Color\\\":\\\"rgba(0, 0, 0, 0.5)\\\",\\\"Font Outline Thickness\\\":\\\"3\\\",\\\"Window Skin\\\":\\\"Window\\\",\\\"Window Opacity\\\":\\\"255\\\",\\\"Show Window Dimmer\\\":\\\"false\\\"}\",\"Draw Actor Name\":\"false\",\"Name X\":\"0\",\"Name Y\":\"0\",\"Draw Actor Points\":\"false\",\"Points Text\":\"Free Points: %1 / %2\",\"Points X\":\"0\",\"Points Y\":\"0\",\"Draw Actor Character\":\"false\",\"Character X\":\"0\",\"Character Y\":\"0\",\"Character Direction\":\"2\",\"Draw Actor Face\":\"false\",\"Face X\":\"0\",\"Face Y\":\"0\",\"Face Width\":\"144\",\"Face Height\":\"144\",\"Draw Actor Battler\":\"false\",\"Battler X\":\"0\",\"Battler Y\":\"0\",\"Battler Scale X\":\"1\",\"Battler Scale Y\":\"1\",\"Battler Motion\":\"none\",\"Draw Actor Profile\":\"false\",\"Profile X\":\"0\",\"Profile Y\":\"0\",\"Draw HP Resource\":\"true\",\"HP Text\":\"\\\\C[3]%1 / %2 (%3 %)\",\"HP X\":\"0\",\"HP Y\":\"0\",\"Draw MP Resource\":\"false\",\"MP Text\":\"%1 / %2 (%3 %)\",\"MP X\":\"0\",\"MP Y\":\"0\",\"Draw TP Resource\":\"false\",\"TP Text\":\"%1 / %2 (%3 %)\",\"TP X\":\"0\",\"TP Y\":\"0\",\"Draw Base Param\":\"[]\",\"Draw Ex Param\":\"[]\",\"Draw Sp Param\":\"[]\",\"Draw Actor States\":\"0\",\"State X\":\"0\",\"State Y\":\"0\",\"State Icon\":\"true\",\"State Name\":\"true\",\"Draw Equip Slots\":\"[]\",\"Draw Actor Class Level\":\"false\",\"Class Text\":\"Class: %1 <LV%2>\",\"Class X\":\"0\",\"Class Y\":\"0\"}","{\"Name\":\"MP\",\"Dimension Configuration\":\"{\\\"X\\\":\\\"Graphics.boxWidth * 0.5\\\",\\\"Y\\\":\\\"192\\\",\\\"Width\\\":\\\"Graphics.boxWidth * 0.5\\\",\\\"Height\\\":\\\"54\\\"}\",\"Window Font and Style Configuration\":\"{\\\"Font Settings\\\":\\\"\\\",\\\"Font Size\\\":\\\"24\\\",\\\"Font Face\\\":\\\"sans-serif\\\",\\\"Base Font Color\\\":\\\"#ffffff\\\",\\\"Font Outline Color\\\":\\\"rgba(0, 0, 0, 0.5)\\\",\\\"Font Outline Thickness\\\":\\\"3\\\",\\\"Window Skin\\\":\\\"Window\\\",\\\"Window Opacity\\\":\\\"255\\\",\\\"Show Window Dimmer\\\":\\\"false\\\"}\",\"Draw Actor Name\":\"false\",\"Name X\":\"0\",\"Name Y\":\"0\",\"Draw Actor Points\":\"false\",\"Points Text\":\"Free Points: %1 / %2\",\"Points X\":\"0\",\"Points Y\":\"0\",\"Draw Actor Character\":\"false\",\"Character X\":\"0\",\"Character Y\":\"0\",\"Character Direction\":\"2\",\"Draw Actor Face\":\"false\",\"Face X\":\"0\",\"Face Y\":\"0\",\"Face Width\":\"144\",\"Face Height\":\"144\",\"Draw Actor Battler\":\"false\",\"Battler X\":\"0\",\"Battler Y\":\"0\",\"Battler Scale X\":\"1\",\"Battler Scale Y\":\"1\",\"Battler Motion\":\"none\",\"Draw Actor Profile\":\"false\",\"Profile X\":\"0\",\"Profile Y\":\"0\",\"Draw HP Resource\":\"false\",\"HP Text\":\"%1 / %2 (%3 %)\",\"HP X\":\"0\",\"HP Y\":\"0\",\"Draw MP Resource\":\"true\",\"MP Text\":\"\\\\C[1]%1 / %2 (%3 %)\",\"MP X\":\"0\",\"MP Y\":\"0\",\"Draw TP Resource\":\"false\",\"TP Text\":\"%1 / %2 (%3 %)\",\"TP X\":\"0\",\"TP Y\":\"0\",\"Draw Base Param\":\"[]\",\"Draw Ex Param\":\"[]\",\"Draw Sp Param\":\"[]\",\"Draw Actor States\":\"0\",\"State X\":\"0\",\"State Y\":\"0\",\"State Icon\":\"true\",\"State Name\":\"true\",\"Draw Equip Slots\":\"[]\",\"Draw Actor Class Level\":\"false\",\"Class Text\":\"Class: %1 <LV%2>\",\"Class X\":\"0\",\"Class Y\":\"0\"}","{\"Name\":\"ATK\",\"Dimension Configuration\":\"{\\\"X\\\":\\\"0\\\",\\\"Y\\\":\\\"246\\\",\\\"Width\\\":\\\"135\\\",\\\"Height\\\":\\\"135\\\"}\",\"Window Font and Style Configuration\":\"{\\\"Font Settings\\\":\\\"\\\",\\\"Font Size\\\":\\\"24\\\",\\\"Font Face\\\":\\\"sans-serif\\\",\\\"Base Font Color\\\":\\\"#ffffff\\\",\\\"Font Outline Color\\\":\\\"rgba(0, 0, 0, 0.5)\\\",\\\"Font Outline Thickness\\\":\\\"3\\\",\\\"Window Skin\\\":\\\"Window\\\",\\\"Window Opacity\\\":\\\"255\\\",\\\"Show Window Dimmer\\\":\\\"false\\\"}\",\"Draw Actor Name\":\"false\",\"Name X\":\"0\",\"Name Y\":\"0\",\"Draw Actor Points\":\"false\",\"Points Text\":\"Free Points: %1 / %2\",\"Points X\":\"0\",\"Points Y\":\"0\",\"Draw Actor Character\":\"false\",\"Character X\":\"0\",\"Character Y\":\"0\",\"Character Direction\":\"2\",\"Draw Actor Face\":\"false\",\"Face X\":\"0\",\"Face Y\":\"0\",\"Face Width\":\"144\",\"Face Height\":\"144\",\"Draw Actor Battler\":\"true\",\"Battler X\":\"72\",\"Battler Y\":\"72\",\"Battler Scale X\":\"1\",\"Battler Scale Y\":\"1\",\"Battler Motion\":\"thrust\",\"Draw Actor Profile\":\"false\",\"Profile X\":\"0\",\"Profile Y\":\"0\",\"Draw HP Resource\":\"false\",\"HP Text\":\"%1 / %2 (%3 %)\",\"HP X\":\"0\",\"HP Y\":\"0\",\"Draw MP Resource\":\"false\",\"MP Text\":\"%1 / %2 (%3 %)\",\"MP X\":\"0\",\"MP Y\":\"0\",\"Draw TP Resource\":\"false\",\"TP Text\":\"%1 / %2 (%3 %)\",\"TP X\":\"0\",\"TP Y\":\"0\",\"Draw Base Param\":\"[\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"STAT\\\\\\\",\\\\\\\"Param\\\\\\\":\\\\\\\"2\\\\\\\",\\\\\\\"Text\\\\\\\":\\\\\\\"\\\\\\\\\\\\\\\\I[76]%1\\\\\\\",\\\\\\\"X\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"Y\\\\\\\":\\\\\\\"72\\\\\\\"}\\\"]\",\"Draw Ex Param\":\"[]\",\"Draw Sp Param\":\"[]\",\"Draw Actor States\":\"0\",\"State X\":\"0\",\"State Y\":\"0\",\"State Icon\":\"true\",\"State Name\":\"true\",\"Draw Equip Slots\":\"[]\",\"Draw Actor Class Level\":\"false\",\"Class Text\":\"Class: %1 <LV%2>\",\"Class X\":\"0\",\"Class Y\":\"0\"}","{\"Name\":\"DEF\",\"Dimension Configuration\":\"{\\\"X\\\":\\\"135\\\",\\\"Y\\\":\\\"246\\\",\\\"Width\\\":\\\"135\\\",\\\"Height\\\":\\\"135\\\"}\",\"Window Font and Style Configuration\":\"{\\\"Font Settings\\\":\\\"\\\",\\\"Font Size\\\":\\\"24\\\",\\\"Font Face\\\":\\\"sans-serif\\\",\\\"Base Font Color\\\":\\\"#ffffff\\\",\\\"Font Outline Color\\\":\\\"rgba(0, 0, 0, 0.5)\\\",\\\"Font Outline Thickness\\\":\\\"3\\\",\\\"Window Skin\\\":\\\"Window\\\",\\\"Window Opacity\\\":\\\"255\\\",\\\"Show Window Dimmer\\\":\\\"false\\\"}\",\"Draw Actor Name\":\"false\",\"Name X\":\"0\",\"Name Y\":\"0\",\"Draw Actor Points\":\"false\",\"Points Text\":\"Free Points: %1 / %2\",\"Points X\":\"0\",\"Points Y\":\"0\",\"Draw Actor Character\":\"false\",\"Character X\":\"0\",\"Character Y\":\"0\",\"Character Direction\":\"2\",\"Draw Actor Face\":\"false\",\"Face X\":\"0\",\"Face Y\":\"0\",\"Face Width\":\"144\",\"Face Height\":\"144\",\"Draw Actor Battler\":\"true\",\"Battler X\":\"72\",\"Battler Y\":\"72\",\"Battler Scale X\":\"1\",\"Battler Scale Y\":\"1\",\"Battler Motion\":\"guard\",\"Draw Actor Profile\":\"false\",\"Profile X\":\"0\",\"Profile Y\":\"0\",\"Draw HP Resource\":\"false\",\"HP Text\":\"%1 / %2 (%3 %)\",\"HP X\":\"0\",\"HP Y\":\"0\",\"Draw MP Resource\":\"false\",\"MP Text\":\"%1 / %2 (%3 %)\",\"MP X\":\"0\",\"MP Y\":\"0\",\"Draw TP Resource\":\"false\",\"TP Text\":\"%1 / %2 (%3 %)\",\"TP X\":\"0\",\"TP Y\":\"0\",\"Draw Base Param\":\"[\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"STAT\\\\\\\",\\\\\\\"Param\\\\\\\":\\\\\\\"3\\\\\\\",\\\\\\\"Text\\\\\\\":\\\\\\\"\\\\\\\\\\\\\\\\I[81]%1\\\\\\\",\\\\\\\"X\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"Y\\\\\\\":\\\\\\\"72\\\\\\\"}\\\"]\",\"Draw Ex Param\":\"[]\",\"Draw Sp Param\":\"[]\",\"Draw Actor States\":\"0\",\"State X\":\"0\",\"State Y\":\"0\",\"State Icon\":\"true\",\"State Name\":\"true\",\"Draw Equip Slots\":\"[]\",\"Draw Actor Class Level\":\"false\",\"Class Text\":\"Class: %1 <LV%2>\",\"Class X\":\"0\",\"Class Y\":\"0\"}","{\"Name\":\"MAT\",\"Dimension Configuration\":\"{\\\"X\\\":\\\"270\\\",\\\"Y\\\":\\\"246\\\",\\\"Width\\\":\\\"135\\\",\\\"Height\\\":\\\"135\\\"}\",\"Window Font and Style Configuration\":\"{\\\"Font Settings\\\":\\\"\\\",\\\"Font Size\\\":\\\"24\\\",\\\"Font Face\\\":\\\"sans-serif\\\",\\\"Base Font Color\\\":\\\"#ffffff\\\",\\\"Font Outline Color\\\":\\\"rgba(0, 0, 0, 0.5)\\\",\\\"Font Outline Thickness\\\":\\\"3\\\",\\\"Window Skin\\\":\\\"Window\\\",\\\"Window Opacity\\\":\\\"255\\\",\\\"Show Window Dimmer\\\":\\\"false\\\"}\",\"Draw Actor Name\":\"false\",\"Name X\":\"0\",\"Name Y\":\"0\",\"Draw Actor Points\":\"false\",\"Points Text\":\"Free Points: %1 / %2\",\"Points X\":\"0\",\"Points Y\":\"0\",\"Draw Actor Character\":\"false\",\"Character X\":\"0\",\"Character Y\":\"0\",\"Character Direction\":\"2\",\"Draw Actor Face\":\"false\",\"Face X\":\"0\",\"Face Y\":\"0\",\"Face Width\":\"144\",\"Face Height\":\"144\",\"Draw Actor Battler\":\"true\",\"Battler X\":\"72\",\"Battler Y\":\"72\",\"Battler Scale X\":\"1\",\"Battler Scale Y\":\"1\",\"Battler Motion\":\"chant\",\"Draw Actor Profile\":\"false\",\"Profile X\":\"0\",\"Profile Y\":\"0\",\"Draw HP Resource\":\"false\",\"HP Text\":\"%1 / %2 (%3 %)\",\"HP X\":\"0\",\"HP Y\":\"0\",\"Draw MP Resource\":\"false\",\"MP Text\":\"%1 / %2 (%3 %)\",\"MP X\":\"0\",\"MP Y\":\"0\",\"Draw TP Resource\":\"false\",\"TP Text\":\"%1 / %2 (%3 %)\",\"TP X\":\"0\",\"TP Y\":\"0\",\"Draw Base Param\":\"[\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"STAT\\\\\\\",\\\\\\\"Param\\\\\\\":\\\\\\\"4\\\\\\\",\\\\\\\"Text\\\\\\\":\\\\\\\"\\\\\\\\\\\\\\\\I[79]%1\\\\\\\",\\\\\\\"X\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"Y\\\\\\\":\\\\\\\"72\\\\\\\"}\\\"]\",\"Draw Ex Param\":\"[]\",\"Draw Sp Param\":\"[]\",\"Draw Actor States\":\"0\",\"State X\":\"0\",\"State Y\":\"0\",\"State Icon\":\"true\",\"State Name\":\"true\",\"Draw Equip Slots\":\"[]\",\"Draw Actor Class Level\":\"false\",\"Class Text\":\"Class: %1 <LV%2>\",\"Class X\":\"0\",\"Class Y\":\"0\"}","{\"Name\":\"MDF\",\"Dimension Configuration\":\"{\\\"X\\\":\\\"405\\\",\\\"Y\\\":\\\"246\\\",\\\"Width\\\":\\\"135\\\",\\\"Height\\\":\\\"135\\\"}\",\"Window Font and Style Configuration\":\"{\\\"Font Settings\\\":\\\"\\\",\\\"Font Size\\\":\\\"24\\\",\\\"Font Face\\\":\\\"sans-serif\\\",\\\"Base Font Color\\\":\\\"#ffffff\\\",\\\"Font Outline Color\\\":\\\"rgba(0, 0, 0, 0.5)\\\",\\\"Font Outline Thickness\\\":\\\"3\\\",\\\"Window Skin\\\":\\\"Window\\\",\\\"Window Opacity\\\":\\\"255\\\",\\\"Show Window Dimmer\\\":\\\"false\\\"}\",\"Draw Actor Name\":\"false\",\"Name X\":\"0\",\"Name Y\":\"0\",\"Draw Actor Points\":\"false\",\"Points Text\":\"Free Points: %1 / %2\",\"Points X\":\"0\",\"Points Y\":\"0\",\"Draw Actor Character\":\"false\",\"Character X\":\"0\",\"Character Y\":\"0\",\"Character Direction\":\"2\",\"Draw Actor Face\":\"false\",\"Face X\":\"0\",\"Face Y\":\"0\",\"Face Width\":\"144\",\"Face Height\":\"144\",\"Draw Actor Battler\":\"true\",\"Battler X\":\"72\",\"Battler Y\":\"72\",\"Battler Scale X\":\"1\",\"Battler Scale Y\":\"1\",\"Battler Motion\":\"damage\",\"Draw Actor Profile\":\"false\",\"Profile X\":\"0\",\"Profile Y\":\"0\",\"Draw HP Resource\":\"false\",\"HP Text\":\"%1 / %2 (%3 %)\",\"HP X\":\"0\",\"HP Y\":\"0\",\"Draw MP Resource\":\"false\",\"MP Text\":\"%1 / %2 (%3 %)\",\"MP X\":\"0\",\"MP Y\":\"0\",\"Draw TP Resource\":\"false\",\"TP Text\":\"%1 / %2 (%3 %)\",\"TP X\":\"0\",\"TP Y\":\"0\",\"Draw Base Param\":\"[\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"STAT\\\\\\\",\\\\\\\"Param\\\\\\\":\\\\\\\"5\\\\\\\",\\\\\\\"Text\\\\\\\":\\\\\\\"\\\\\\\\\\\\\\\\I[89]%1\\\\\\\",\\\\\\\"X\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"Y\\\\\\\":\\\\\\\"72\\\\\\\"}\\\"]\",\"Draw Ex Param\":\"[]\",\"Draw Sp Param\":\"[]\",\"Draw Actor States\":\"0\",\"State X\":\"0\",\"State Y\":\"0\",\"State Icon\":\"true\",\"State Name\":\"true\",\"Draw Equip Slots\":\"[]\",\"Draw Actor Class Level\":\"false\",\"Class Text\":\"Class: %1 <LV%2>\",\"Class X\":\"0\",\"Class Y\":\"0\"}","{\"Name\":\"AGI\",\"Dimension Configuration\":\"{\\\"X\\\":\\\"540\\\",\\\"Y\\\":\\\"246\\\",\\\"Width\\\":\\\"135\\\",\\\"Height\\\":\\\"135\\\"}\",\"Window Font and Style Configuration\":\"{\\\"Font Settings\\\":\\\"\\\",\\\"Font Size\\\":\\\"24\\\",\\\"Font Face\\\":\\\"sans-serif\\\",\\\"Base Font Color\\\":\\\"#ffffff\\\",\\\"Font Outline Color\\\":\\\"rgba(0, 0, 0, 0.5)\\\",\\\"Font Outline Thickness\\\":\\\"3\\\",\\\"Window Skin\\\":\\\"Window\\\",\\\"Window Opacity\\\":\\\"255\\\",\\\"Show Window Dimmer\\\":\\\"false\\\"}\",\"Draw Actor Name\":\"false\",\"Name X\":\"0\",\"Name Y\":\"0\",\"Draw Actor Points\":\"false\",\"Points Text\":\"Free Points: %1 / %2\",\"Points X\":\"0\",\"Points Y\":\"0\",\"Draw Actor Character\":\"false\",\"Character X\":\"0\",\"Character Y\":\"0\",\"Character Direction\":\"2\",\"Draw Actor Face\":\"false\",\"Face X\":\"0\",\"Face Y\":\"0\",\"Face Width\":\"144\",\"Face Height\":\"144\",\"Draw Actor Battler\":\"true\",\"Battler X\":\"72\",\"Battler Y\":\"72\",\"Battler Scale X\":\"1\",\"Battler Scale Y\":\"1\",\"Battler Motion\":\"evade\",\"Draw Actor Profile\":\"false\",\"Profile X\":\"0\",\"Profile Y\":\"0\",\"Draw HP Resource\":\"false\",\"HP Text\":\"%1 / %2 (%3 %)\",\"HP X\":\"0\",\"HP Y\":\"0\",\"Draw MP Resource\":\"false\",\"MP Text\":\"%1 / %2 (%3 %)\",\"MP X\":\"0\",\"MP Y\":\"0\",\"Draw TP Resource\":\"false\",\"TP Text\":\"%1 / %2 (%3 %)\",\"TP X\":\"0\",\"TP Y\":\"0\",\"Draw Base Param\":\"[\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"STAT\\\\\\\",\\\\\\\"Param\\\\\\\":\\\\\\\"6\\\\\\\",\\\\\\\"Text\\\\\\\":\\\\\\\"\\\\\\\\\\\\\\\\I[82]%1\\\\\\\",\\\\\\\"X\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"Y\\\\\\\":\\\\\\\"72\\\\\\\"}\\\"]\",\"Draw Ex Param\":\"[]\",\"Draw Sp Param\":\"[]\",\"Draw Actor States\":\"0\",\"State X\":\"0\",\"State Y\":\"0\",\"State Icon\":\"true\",\"State Name\":\"true\",\"Draw Equip Slots\":\"[]\",\"Draw Actor Class Level\":\"false\",\"Class Text\":\"Class: %1 <LV%2>\",\"Class X\":\"0\",\"Class Y\":\"0\"}","{\"Name\":\"LUK\",\"Dimension Configuration\":\"{\\\"X\\\":\\\"675\\\",\\\"Y\\\":\\\"246\\\",\\\"Width\\\":\\\"135\\\",\\\"Height\\\":\\\"135\\\"}\",\"Window Font and Style Configuration\":\"{\\\"Font Settings\\\":\\\"\\\",\\\"Font Size\\\":\\\"24\\\",\\\"Font Face\\\":\\\"sans-serif\\\",\\\"Base Font Color\\\":\\\"#ffffff\\\",\\\"Font Outline Color\\\":\\\"rgba(0, 0, 0, 0.5)\\\",\\\"Font Outline Thickness\\\":\\\"3\\\",\\\"Window Skin\\\":\\\"Window\\\",\\\"Window Opacity\\\":\\\"255\\\",\\\"Show Window Dimmer\\\":\\\"false\\\"}\",\"Draw Actor Name\":\"false\",\"Name X\":\"0\",\"Name Y\":\"0\",\"Draw Actor Points\":\"false\",\"Points Text\":\"Free Points: %1 / %2\",\"Points X\":\"0\",\"Points Y\":\"0\",\"Draw Actor Character\":\"false\",\"Character X\":\"0\",\"Character Y\":\"0\",\"Character Direction\":\"2\",\"Draw Actor Face\":\"false\",\"Face X\":\"0\",\"Face Y\":\"0\",\"Face Width\":\"144\",\"Face Height\":\"144\",\"Draw Actor Battler\":\"true\",\"Battler X\":\"72\",\"Battler Y\":\"72\",\"Battler Scale X\":\"1\",\"Battler Scale Y\":\"1\",\"Battler Motion\":\"abnormal\",\"Draw Actor Profile\":\"false\",\"Profile X\":\"0\",\"Profile Y\":\"0\",\"Draw HP Resource\":\"false\",\"HP Text\":\"%1 / %2 (%3 %)\",\"HP X\":\"0\",\"HP Y\":\"0\",\"Draw MP Resource\":\"false\",\"MP Text\":\"%1 / %2 (%3 %)\",\"MP X\":\"0\",\"MP Y\":\"0\",\"Draw TP Resource\":\"false\",\"TP Text\":\"%1 / %2 (%3 %)\",\"TP X\":\"0\",\"TP Y\":\"0\",\"Draw Base Param\":\"[\\\"{\\\\\\\"Name\\\\\\\":\\\\\\\"STAT\\\\\\\",\\\\\\\"Param\\\\\\\":\\\\\\\"7\\\\\\\",\\\\\\\"Text\\\\\\\":\\\\\\\"\\\\\\\\\\\\\\\\I[72]%1\\\\\\\",\\\\\\\"X\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"Y\\\\\\\":\\\\\\\"72\\\\\\\"}\\\"]\",\"Draw Ex Param\":\"[]\",\"Draw Sp Param\":\"[]\",\"Draw Actor States\":\"0\",\"State X\":\"0\",\"State Y\":\"0\",\"State Icon\":\"true\",\"State Name\":\"true\",\"Draw Equip Slots\":\"[]\",\"Draw Actor Class Level\":\"false\",\"Class Text\":\"Class: %1 <LV%2>\",\"Class X\":\"0\",\"Class Y\":\"0\"}"]
 * 
 * @param Allocation Window
 * @desc The window for the allocation of stat
 * @type struct<allocationWindow>
 * @default {"Dimension Configuration":"{\"X\":\"0\",\"Y\":\"Graphics.boxHeight - 112\",\"Width\":\"Graphics.boxWidth\",\"Height\":\"112\"}","Window Font and Style Configuration":"{\"Font Settings\":\"\",\"Font Size\":\"16\",\"Font Face\":\"sans-serif\",\"Base Font Color\":\"#ffffff\",\"Font Outline Color\":\"rgba(0, 0, 0, 0.5)\",\"Font Outline Thickness\":\"3\",\"Window Skin\":\"Window\",\"Window Opacity\":\"255\",\"Show Window Dimmer\":\"false\"}","Item Width":"96","Item Height":"72","Vertical Mode":"false","Points Text":"%1\\n(%2)","Points Text Offset X":"30","Points Text Offset Y":"40"}
 * 
 * @param HP Stat Image
 * @desc The image for the stat
 * @type struct<statImg>
 * 
 * @param MP Stat Image
 * @desc The image for the stat
 * @type struct<statImg>
 * 
 * @param ATK Stat Image
 * @desc The image for the stat
 * @type struct<statImg>
 * 
 * @param DEF Stat Image
 * @desc The image for the stat
 * @type struct<statImg>
 * 
 * @param MAT Stat Image
 * @desc The image for the stat
 * @type struct<statImg>
 * 
 * @param MDF Stat Image
 * @desc The image for the stat
 * @type struct<statImg>
 * 
 * @param AGI Stat Image
 * @desc The image for the stat
 * @type struct<statImg>
 * 
 * @param LUK Stat Image
 * @desc The image for the stat
 * @type struct<statImg>
 * 
 */
/*~struct~locSize:
 * 
 * @param X
 * @desc Position setting.
 * @type text
 * @default 0
 * 
 * @param Y
 * @desc Position setting.
 * @type text
 * @default 0
 * 
 * @param Width
 * @desc Size setting.
 * @type text
 * @default 1
 * 
 * @param Height
 * @desc Size setting.
 * @type text
 * @default 1
 * 
 */
/*~struct~windowStyle:
 * 
 * @param Font Settings
 * @desc Setup child parameters
 * 
 * @param Font Size
 * @parent Font Settings
 * @desc Size of font.
 * @type text
 * @default 16
 * 
 * @param Font Face
 * @parent Font Settings
 * @desc Font face used for the window.
 * @type text
 * @default sans-serif
 * 
 * @param Base Font Color
 * @parent Font Settings
 * @desc Default font color for window
 * @type text
 * @default #ffffff
 * 
 * @param Font Outline Color
 * @parent Font Settings
 * @desc Default font color for window
 * @type text
 * @default rgba(0, 0, 0, 0.5)
 * 
 * @param Font Outline Thickness
 * @parent Font Settings
 * @desc The thickness of the text outline
 * @type text
 * @default 3
 * 
 * @param Window Skin
 * @desc Image file used for the window skin.
 * @type file
 * @dir img/system/
 * 
 * @param Window Opacity
 * @desc 0 = Fully transparent, 255 = Fully opaque.
 * @type text
 * @default 255
 * 
 * @param Show Window Dimmer
 * @desc Hides window skin
 * @type boolean
 * @default false
 * 
 */
/*~struct~statusSpParam:
 * 
 * @param Name
 * @desc Does absolutely nothing.
 * @type text
 * @default SP PARAM
 * 
 * @param Param
 * @desc Draw sp parameter for actor
 * @type select
 * @option tgr
 * @value 0
 * @option grd
 * @value 1
 * @option rec
 * @value 2
 * @option pha
 * @value 3
 * @option mcr
 * @value 4
 * @option tcr
 * @value 5
 * @option pdr
 * @value 6
 * @option mdr
 * @value 7
 * @option fdr
 * @value 8
 * @option exr
 * @value 9
 * @option none
 * @value 10
 * @default none
 * 
 * @param Text
 * @desc The text to use. %1 represents param value.
 * @type text
 * @default Target Rate: %1
 * 
 * @param X
 * @desc Position sp parameter in window
 * @type number
 * @default 0
 * 
 * @param Y
 * @desc Position sp parameter in window
 * @type number
 * @default 0
 * 
 */
/*~struct~statusExParam:
 * 
 * @param Name
 * @desc Does absolutely nothing.
 * @type text
 * @default EX PARAM
 * 
 * @param Param
 * @desc Draw ex parameter for actor
 * @type select
 * @option hit
 * @value 0
 * @option eva
 * @value 1
 * @option cri
 * @value 2
 * @option cev
 * @value 3
 * @option mev
 * @value 4
 * @option mrf
 * @value 5
 * @option cnt
 * @value 6
 * @option hrg
 * @value 7
 * @option mrg
 * @value 8
 * @option trg
 * @value 9
 * @option none
 * @value 10
 * @default none
 * 
 * @param Text
 * @desc The text to use. %1 represents param value.
 * @type text
 * @default Hit Rate: %1
 * 
 * @param X
 * @desc Position ex parameter in window
 * @type number
 * @default 0
 * 
 * @param Y
 * @desc Position ex parameter in window
 * @type number
 * @default 0
 * 
 */
/*~struct~statusBaseParam:
 * 
 * @param Name
 * @desc Does absolutely nothing.
 * @type text
 * @default BASE PARAM
 * 
 * @param Param
 * @desc Draw base parameter for actor
 * @type select
 * @option hp
 * @value 0
 * @option mp
 * @value 1
 * @option atk
 * @value 2
 * @option def
 * @value 3
 * @option mat
 * @value 4
 * @option mdf
 * @value 5
 * @option agi
 * @value 6
 * @option luk
 * @value 7
 * @option none
 * @value 8
 * @default none
 * 
 * @param Text
 * @desc The text to use. %1 represents param value.
 * @type text
 * @default Max HP: %1
 * 
 * @param X
 * @desc Position base parameter in window
 * @type number
 * @default 0
 * 
 * @param Y
 * @desc Position base parameter in window
 * @type number
 * @default 0
 * 
 */
/*~struct~actorDataWindow:
 * 
 * @param Name
 * @desc No function.
 * @type text
 * @default Actor Window
 * 
 * @param Dimension Configuration
 * @desc Setup position and width of the window
 * @type struct<locSize>
 * @default {"X":"0","Y":"0","Width":"1","Height":"1"}
 * 
 * @param Window Font and Style Configuration
 * @desc Custom style the window
 * @type struct<windowStyle>
 * @default {"Font Settings":"","Font Size":"16","Font Face":"sans-serif","Base Font Color":"#ffffff","Font Outline Color":"rgba(0, 0, 0, 0.5)","Font Outline Thickness":"3","Window Skin":"Window","Window Opacity":"255","Show Window Dimmer":"false"}
 * 
 * @param Draw Actor Name
 * @desc Draw actor name?
 * @type boolean
 * @default false
 * 
 * @param Name X
 * @parent Draw Actor Name
 * @desc Offset in the selector rect.
 * @type text
 * @default 0
 * 
 * @param Name Y
 * @parent Draw Actor Name
 * @desc Offset in the selector rect.
 * @type text
 * @default 0
 * 
 * @param Draw Actor Points
 * @desc Draw actor leveling points
 * @type boolean
 * @default false
 * 
 * @param Points Text
 * @parent Draw Actor Points
 * @desc The text to draw
 * %1 = Remaining, %2 = Total
 * @type text
 * @default Free Points: %1 / %2
 * 
 * @param Points X
 * @parent Draw Actor Points
 * @desc Start position to draw text
 * @type text
 * @default 0
 * 
 * @param Points Y
 * @parent Draw Actor Points
 * @desc Start position to draw text
 * @type text
 * @default 0
 * 
 * @param Draw Actor Character
 * @desc Draw actor character?
 * @type boolean
 * @default false
 * 
 * @param Character X
 * @parent Draw Actor Character
 * @desc Offset in the selector rect.
 * @type text
 * @default 0
 * 
 * @param Character Y
 * @parent Draw Actor Character
 * @desc Offset in the selector rect.
 * @type text
 * @default 0
 * 
 * @param Character Direction
 * @parent Draw Actor Character
 * @desc Sets the character direction.
 * @type select
 * @option down
 * @value 2
 * @option left
 * @value 4
 * @option right
 * @value 6
 * @option up
 * @value 8
 * @default 2
 * 
 * @param Draw Actor Face
 * @desc Draws the actor face graphic from database
 * @type boolean
 * @default false
 * 
 * @param Face X
 * @parent Draw Actor Face
 * @desc Position face in window
 * @type text
 * @default 0
 * 
 * @param Face Y
 * @parent Draw Actor Face
 * @desc Position face in window
 * @type text
 * @default 0
 * 
 * @param Face Width
 * @parent Draw Actor Face
 * @desc Size face in window
 * @type number
 * @default 144
 * 
 * @param Face Height
 * @parent Draw Actor Face
 * @desc Size face in window
 * @type number
 * @default 144
 * 
 * @param Draw Actor Battler
 * @desc Draw SV battler.
 * @type boolean
 * @default false
 * 
 * @param Battler X
 * @parent Draw Actor Battler
 * @desc Position battler in window
 * @type number
 * @default 0
 * 
 * @param Battler Y
 * @parent Draw Actor Battler
 * @desc Position battler in window
 * @type number
 * @default 0
 * 
 * @param Battler Scale X
 * @parent Draw Actor Battler
 * @desc Size battler in window
 * @type number
 * @min -999999
 * @decimals 3
 * @default 1
 * 
 * @param Battler Scale Y
 * @parent Draw Actor Battler
 * @desc Size battler in window
 * @type number
 * @min -999999
 * @decimals 3
 * @default 1
 * 
 * @param Battler Motion
 * @parent Draw Actor Battler
 * @desc Position battler in window
 * @type select
 * @option none
 * @option walk
 * @option wait
 * @option chant
 * @option guard
 * @option damage
 * @option evade
 * @option thrust
 * @option swing
 * @option missile
 * @option skill
 * @option spell
 * @option item
 * @option escape
 * @option victory
 * @option dying
 * @option abnormal
 * @option sleep
 * @option dead
 * @default none
 * 
 * @param Draw Actor Profile
 * @desc Draw actor profile text
 * @type boolean
 * @default false
 * 
 * @param Profile X
 * @parent Draw Actor Profile
 * @desc Position profile text in window
 * @type number
 * @default 0
 * 
 * @param Profile Y
 * @parent Draw Actor Profile
 * @desc Position profile text in window
 * @type number
 * @default 0
 * 
 * @param Draw HP Resource
 * @desc Draw HP?
 * @type boolean
 * @default false
 * 
 * @param HP Text
 * @parent Draw HP Resource
 * @desc %1 = current, %2 = max, %3 = percentage
 * @type text
 * @default %1 / %2 (%3 %)
 * 
 * @param HP X
 * @parent Draw HP Resource
 * @desc Position of text in window.
 * @type number
 * @default 0
 * 
 * @param HP Y
 * @parent Draw HP Resource
 * @desc Position of text in window.
 * @type number
 * @default 0
 * 
 * @param Draw MP Resource
 * @desc Draw MP?
 * @type boolean
 * @default false
 * 
 * @param MP Text
 * @parent Draw MP Resource
 * @desc %1 = current, %2 = max, %3 = percentage
 * @type text
 * @default %1 / %2 (%3 %)
 * 
 * @param MP X
 * @parent Draw MP Resource
 * @desc Position of text in window.
 * @type number
 * @default 0
 * 
 * @param MP Y
 * @parent Draw MP Resource
 * @desc Position of text in window.
 * @type number
 * @default 0
 * 
 * @param Draw TP Resource
 * @desc Draw TP?
 * @type boolean
 * @default false
 * 
 * @param TP Text
 * @parent Draw TP Resource
 * @desc %1 = current, %2 = max, %3 = percentage
 * @type text
 * @default %1 / %2 (%3 %)
 * 
 * @param TP X
 * @parent Draw TP Resource
 * @desc Position of text in window.
 * @type number
 * @default 0
 * 
 * @param TP Y
 * @parent Draw TP Resource
 * @desc Position of text in window.
 * @type number
 * @default 0
 * 
 * @param Draw Base Param
 * @desc Draw base parameter for actor
 * @type struct<statusBaseParam>[]
 * @default []
 * 
 * @param Draw Ex Param
 * @desc Draw ex parameter for actor
 * @type struct<statusExParam>[]
 * @default []
 * 
 * @param Draw Sp Param
 * @desc Draw sp parameter for actor
 * @type struct<statusSpParam>[]
 * @default []
 * 
 * @param Draw Actor States
 * @desc Draws the states the actor currently affected by. Control max number.
 * @type number
 * @default 0
 * 
 * @param State X
 * @parent Draw Actor States
 * @desc Position in window
 * @type number
 * @default 0
 * 
 * @param State Y
 * @parent Draw Actor States
 * @desc Position in window
 * @type number
 * @default 0
 * 
 * @param State Icon
 * @parent Draw Actor States
 * @desc Draw state icon
 * @type boolean
 * @default true
 * 
 * @param State Name
 * @parent Draw Actor States
 * @desc Draw state name
 * @type boolean
 * @default true
 * 
 * @param Draw Equip Slots
 * @desc Draws the equipment the actor currently has.
 * @type struct<statusEquipSlot>[]
 * @default []
 * 
 * @param Draw Actor Class Level
 * @desc Draw actor class name
 * @type boolean
 * @default false
 * 
 * @param Class Text
 * @parent Draw Actor Class Level
 * @desc Class level text in window. %1 = class name, %2 = actor level.
 * @type text
 * @default Class: %1 <LV%2>
 * 
 * @param Class X
 * @parent Draw Actor Class Level
 * @desc Position class name in window
 * @type number
 * @default 0
 * 
 * @param Class Y
 * @parent Draw Actor Class Level
 * @desc Position class level in window
 * @type number
 * @default 0
 * 
 */
/*~struct~allocationWindow:
 * 
 * @param Dimension Configuration
 * @desc Setup position and width of the window
 * @type struct<locSize>
 * @default {"X":"0","Y":"0","Width":"1","Height":"1"}
 * 
 * @param Window Font and Style Configuration
 * @desc Custom style the window
 * @type struct<windowStyle>
 * @default {"Font Settings":"","Font Size":"16","Font Face":"sans-serif","Base Font Color":"#ffffff","Font Outline Color":"rgba(0, 0, 0, 0.5)","Font Outline Thickness":"3","Window Skin":"Window","Window Opacity":"255","Show Window Dimmer":"false"}
 * 
 * @param Item Width
 * @desc The width of each selection
 * @type number
 * @default 100
 * 
 * @param Item Height
 * @desc The width of each selection
 * @type number
 * @default 44
 * 
 * @param Vertical Mode
 * @desc Draw the stat allocation list vertically?
 * @type boolean
 * @default false
 * 
 * @param Points Text
 * @desc How to draw the text.
 * %1 = Allocated Points, %2 = Level Stats
 * @type text
 * @default %1\n(%2)
 * 
 * @param Points Text Offset X
 * @parent Points Text
 * @desc The offset in the selection
 * @type text
 * @default 0
 * 
 * @param Points Text Offset Y
 * @parent Points Text
 * @desc The offset in the selection
 * @type text
 * @default 0
 * 
 */
/*~struct~statImg:
 * 
 * @param Picture
 * @desc The image to use for the stat
 * @type file
 * @dir img/pictures/
 * 
 * @param Offset X
 * @desc Offset in the window selection
 * @type text
 * @default 0
 * 
 * @param Offset Y
 * @desc Offset in the window selection
 * @type text
 * @default 0
 * 
 * @param Draw Width
 * @desc The draw size of the image
 * @type text
 * @default 1
 * 
 * @param Draw Height
 * @desc The draw size of the image
 * @type text
 * @default 1
 * 
 */
/*~struct~actorConfig:
 * 
 * @param Name
 * @desc No function
 * @type text
 * @default ACTOR
 * 
 * @param Actor
 * @desc The actor to apply settings for
 * @type actor
 * @default 1
 * 
 * @param Stats Per Level
 * @desc The number of stats per level.
 * @type text
 * @default 1
 * 
 * @param Base Param Growth
 * @desc Grants a set number of stats per point allocated
 * Set one per parameter
 * @type struct<baseParam>[]
 * @default []
 * 
 */
/*~struct~baseParam:
 *
 * @param Name
 * @desc Does nothing
 * @type text
 * @default BASE PARAM
 *
 * @param Parameter
 * @desc Select parameter modified
 * @type select
 * @option mhp
 * @value 0
 * @option mmp
 * @value 1
 * @option atk
 * @value 2
 * @option def
 * @value 3
 * @option mat
 * @value 4
 * @option mdf
 * @value 5
 * @option agi
 * @value 6
 * @option luk
 * @value 7
 * @default 0
 *
 * @param Value
 * @desc Magnitude of modification
 * @type text
 * @default 0
 *
 */

function LEVEL_STATS_DATA_PARSER(parameters) {
    if (typeof parameters == 'object') {
        const keys = Object.keys(parameters);
        keys.forEach((key) => {
            if (isNaN(parameters[key])) {
                try {
                    parameters[key] = JSON.parse(parameters[key]);
                } catch (e) {
                    parameters[key] = parameters[key];
                }
            }
            if (typeof parameters[key] == 'object') {
                parameters[key] = LEVEL_STATS_DATA_PARSER(parameters[key]);
            } else if (Array.isArray(parameters[key])) {
                parameters[key] = parameters[key].map((data) => {
                    if (isNaN(data)) {
                        try {
                            data = JSON.parse(data);
                        } catch (e) {
                            data = data;
                        }
                    }
                    if (typeof data == 'object') {
                        data = LEVEL_STATS_DATA_PARSER(data);
                    }
                    return data;
                })
            }
        })
    }
    return parameters;
}

const Syn_LvlStats = {};
function LOAD_LEVEL_STATS_DATA(){
    Syn_LvlStats.Plugin = PluginManager.parameters(`Synrec_LevelStats`);
    Syn_LvlStats.DATA = LEVEL_STATS_DATA_PARSER(Syn_LvlStats.Plugin);

    Syn_LvlStats.ACTOR_CONFIGURATIONS = Syn_LvlStats.DATA['Actor Configurations'];
    Syn_LvlStats.DATA_WINDOWS = Syn_LvlStats.DATA['Actor Data Windows'];
    Syn_LvlStats.ALLOCATION_WINDOW_CONFIG = Syn_LvlStats.DATA['Allocation Window'];

    Syn_LvlStats.HP_IMG_STAT = Syn_LvlStats.DATA['HP Stat Image'];
    Syn_LvlStats.MP_IMG_STAT = Syn_LvlStats.DATA['MP Stat Image'];
    Syn_LvlStats.ATK_IMG_STAT = Syn_LvlStats.DATA['ATK Stat Image'];
    Syn_LvlStats.DEF_IMG_STAT = Syn_LvlStats.DATA['DEF Stat Image'];
    Syn_LvlStats.MAT_IMG_STAT = Syn_LvlStats.DATA['MAT Stat Image'];
    Syn_LvlStats.MDF_IMG_STAT = Syn_LvlStats.DATA['MDF Stat Image'];
    Syn_LvlStats.AGI_IMG_STAT = Syn_LvlStats.DATA['AGI Stat Image'];
    Syn_LvlStats.LUK_IMG_STAT = Syn_LvlStats.DATA['LUK Stat Image'];
}

function RELOAD_LEVEL_STATS_DATA(){
    LOAD_LEVEL_STATS_DATA();
}

LOAD_LEVEL_STATS_DATA();

if(Utils.RPGMAKER_NAME == "MZ"){
    PluginManager.registerCommand(`Synrec_LevelStats`, `Open Stat Allocation`, ()=>{
        SceneManager.push(SceneSynrec_StatAllocation);
    })
}

Syn_LvlStats_GmActr_Setup = Game_Actor.prototype.setup;
Game_Actor.prototype.setup = function() {
    Syn_LvlStats_GmActr_Setup.call(this, ...arguments);
    this.initLevelStats();
    this.recoverAll();
}

Game_Actor.prototype.initLevelStats = function(){
    this._level_stat_points = 0;
    this._level_stats_class = {};
    this._level_stats_allocated = [0,0,0,0,0,0,0,0];
    this._level_stats = [0,0,0,0,0,0,0,0];
    this._level_stats_class = JsonEx.makeDeepCopy(this._classId);
    this._level_stats_class[this._classId] = {
        level:0,
        allocated: [0,0,0,0,0,0,0,0]
    }
    this._point_level_barrier = 0;
    this._level_stat_points = this.maxLevelPoints();
}

Game_Actor.prototype.gainLevelStatPoint = function(levels){
    if(isNaN(levels))levels = 0;
    if(isNaN(this._level_stat_points))this.initLevelStats();
    const actor_id = this._actorId;
    const config = Syn_LvlStats.ACTOR_CONFIGURATIONS.find((config)=>{
        return eval(config['Actor']) == actor_id;
    })
    if(!config)return;
    const cur_lvl = this._level;
    const bar_lvl = this._point_level_barrier || 0;
    if(levels > 0){
        if(cur_lvl < bar_lvl)return;
    }
    if(levels < 0){
        if(cur_lvl > bar_lvl)return;
    }
    this._point_level_barrier = JsonEx.makeDeepCopy(cur_lvl);
    const stat_per_level = eval(config['Stats Per Level']);
    this._level_stat_points += stat_per_level * levels;
}

Game_Actor.prototype.boostLevelStats = function(value, paramId){
    if(isNaN(this._level_stat_points))this.initLevelStats();
    if(isNaN(value))value = 0;
    value = value.clamp(0, this._level_stat_points);
    const actor_id = this._actorId;
    const config = Syn_LvlStats.ACTOR_CONFIGURATIONS.find((config)=>{
        return eval(config['Actor']) == actor_id;
    })
    if(!config)return;
    const base_param_growths = config['Base Param Growth'];
    if(!Array.isArray(base_param_growths))return;
    const growth_data = base_param_growths.find((data)=>{
        return eval(data['Parameter']) == paramId;
    })
    console.log(config);
    console.log(growth_data, paramId);
    if(growth_data){
        const inc_rate = eval(growth_data['Value']) || 0;
        if(value > 0){
            this._level_stats[paramId] += inc_rate * value;
            this._level_stats_allocated[paramId] += value;
            this._level_stat_points -= value;
            return true;
        }
    }
    return false;
}

Game_Actor.prototype.availableLevelPoints = function(){
    if(isNaN(this._level_stat_points))this.initLevelStats();
    return this._level_stat_points;
}

Game_Actor.prototype.maxLevelPoints = function(){
    if(isNaN(this._level_stat_points))this.initLevelStats();
    const actor_id = this._actorId;
    const config = Syn_LvlStats.ACTOR_CONFIGURATIONS.find((config)=>{
        return eval(config['Actor']) == actor_id;
    })
    if(!config)return 0;
    const stat_per_level = eval(config['Stats Per Level']) || 0;
    const lvl = Math.max(0, this._level - 1);
    return lvl * stat_per_level;
}

Game_Actor.prototype.allocatedLevelPoints = function(paramId){
    if(isNaN(this._level_stat_points))this.initLevelStats();
    if(isNaN(paramId))return this._level_stats_allocated;
    return this._level_stats_allocated[paramId];
}

Game_Actor.prototype.levelBaseParam = function(paramId){
    if(isNaN(this._level_stat_points))this.initLevelStats();
    return this._level_stats[paramId];
}

Syn_LvlStats_GmActr_Param = Game_Actor.prototype.param;
Game_Actor.prototype.param = function(paramId) {
    if(isNaN(paramId))console.trace();
    const value = Syn_LvlStats_GmActr_Param.call(this, ...arguments) + this.levelBaseParam(paramId);
    const maxValue = this.paramMax(paramId);
    const minValue = this.paramMin(paramId);
    return Math.round(value.clamp(minValue, maxValue));
}

Syn_LvlStats_GmActr_LvlUp = Game_Actor.prototype.levelUp;
Game_Actor.prototype.levelUp = function() {
    Syn_LvlStats_GmActr_LvlUp.call(this, ...arguments);
    this.gainLevelStatPoint(1);
}

Syn_LvlStats_GmActr_LvlDn = Game_Actor.prototype.levelDown;
Game_Actor.prototype.levelDown = function() {
    Syn_LvlStats_GmActr_LvlDn.call(this, ...arguments);
    this.gainLevelStatPoint(-1);
}

Syn_LvlStats_GmActr_ChgCls = Game_Actor.prototype.changeClass;
Game_Actor.prototype.changeClass = function(classId, keepExp) {
    this.saveAllocatedPoints();
    this.resetLevelPointData();
    Syn_LvlStats_GmActr_ChgCls.call(this, ...arguments);
    this.loadAllocatedPoints(classId)
}

Game_Actor.prototype.saveAllocatedPoints = function(){
    const old_class = JsonEx.makeDeepCopy(this._classId);
    const old_level = JsonEx.makeDeepCopy(this._level);
    const old_allocated = JsonEx.makeDeepCopy(this._level_stats_allocated);
    this._level_stats_class[old_class] = {
        level:old_level,
        allocated: old_allocated
    }
}

Game_Actor.prototype.resetLevelPointData = function(){
    this._level_stat_points = 0;
    this._level_stats_allocated = [0,0,0,0,0,0,0,0];
    this._level_stats = [0,0,0,0,0,0,0,0];
}

Game_Actor.prototype.loadAllocatedPoints = function(classId){
    const class_data = this._level_stats_class[classId];
    if(class_data){
        const level = this._level;
        const data_level = class_data.level;
        const allocated = class_data.allocated;
        for(let i = 0; i < 8; i++){
            this.boostLevelStats(allocated[i], i);
        }
        this._point_level_barrier = level;
    }
}

function GameSyn_WindowCharacterStats() {
    this.initialize(...arguments);
}

GameSyn_WindowCharacterStats.prototype = Object.create(Game_Character.prototype);
GameSyn_WindowCharacterStats.prototype.constructor = GameSyn_WindowCharacterStats;

GameSyn_WindowCharacterStats.prototype.screenX = function () {
    return this._screenX || 0;
}

GameSyn_WindowCharacterStats.prototype.screenY = function () {
    return this._screenY || 0;
}

GameSyn_WindowCharacterStats.prototype.screenZ = function () {
    return 1;
}

GameSyn_WindowCharacterStats.prototype.setActor = function (actor) {
    if (actor instanceof (Game_Actor)) {
        const char_name = actor.characterName();
        const char_index = actor.characterIndex();
        this.setImage(char_name, char_index);
        this.setStepAnime(true);
    } else {
        this.setImage("", 0);
    }
}

GameSyn_WindowCharacterStats.prototype.setEnemy = function (enemy) {
    const enemy_configs = SynTBS.Enemy_Configurations;
    if (enemy instanceof (Game_Enemy)) {
        const enemy_tbs_data = enemy_configs.find((config) => {
            return eval(config['Enemy']) == enemy._enemyId;
        })
        if (enemy_tbs_data) {
            const battler_data = enemy_tbs_data['Battler Configuration'];
            const char_name = battler_data['Character File (Override)'];
            const char_index = eval(battler_data['Character Index (Override)']);
            this.setImage(char_name, char_index);
            this.setStepAnime(true);
        } else {
            const char_name = SynTBS.DefEnemChar;
            const char_index = eval(SynTBS.DefEnemIndx);
            this.setImage(char_name, char_index);
            this.setStepAnime(true);
        }
    } else {
        this.setImage("", 0);
    }
}

GameSyn_WindowCharacterStats.prototype.setScreenX = function (num) {
    isNaN(num) ? num = 0 : num;
    this._screenX = num;
}

GameSyn_WindowCharacterStats.prototype.setScreenY = function (num) {
    isNaN(num) ? num = 0 : num;
    this._screenY = num;
}

function WindowSynrec_ActorData() {
    this.initialize(...arguments);
}

WindowSynrec_ActorData.prototype = Object.create(Window_Base.prototype);
WindowSynrec_ActorData.prototype.constructor = WindowSynrec_ActorData;

WindowSynrec_ActorData.prototype.initialize = function (data) {
    const mz_mode = Utils.RPGMAKER_NAME == "MZ";
    const rect = this.createRect(data);
    this._custom_data = data;
    this._style_data = data['Window Font and Style Configuration'];
    if (mz_mode) {
        Window_Base.prototype.initialize.call(this, rect);
    } else {
        const x = rect.x;
        const y = rect.y;
        const w = rect.width;
        const h = rect.height;
        Window_Base.prototype.initialize.call(this, x, y, w, h);
    }
    this.setOpacityAndDimmer();
    this.hide();
    this._autoRefresh = 12;
}

WindowSynrec_ActorData.prototype.createRect = function (data) {
    const dimension_config = data['Dimension Configuration'];
    const x = eval(dimension_config['X']);
    const y = eval(dimension_config['Y']);
    const w = eval(dimension_config['Width']);
    const h = eval(dimension_config['Height']);
    return new Rectangle(x, y, w, h);
}

WindowSynrec_ActorData.prototype.standardPadding = function () {
    return 8;
}

WindowSynrec_ActorData.prototype.loadWindowskin = function () {
    const base = Window_Base.prototype.loadWindowskin.call(this);
    const custom_config = this._style_data;
    if (!custom_config) return base;
    const skin_name = custom_config['Window Skin'];
    if (!skin_name) return base;
    this.windowskin = ImageManager.loadSystem(skin_name);
}

WindowSynrec_ActorData.prototype.resetFontSettings = function () {
    const base = Window_Base.prototype.resetFontSettings;
    const custom_config = this._style_data;
    if (!custom_config) return base.call(this);
    const font_face = custom_config['Font Face'] || "sans-serif";
    const font_size = eval(custom_config['Font Size']) || 16;
    const font_outline_size = eval(custom_config['Font Outline Thickness']) || 3;
    this.contents.fontFace = font_face;
    this.contents.fontSize = font_size;
    this.contents.outlineWidth = font_outline_size;
    this.resetTextColor();
}

WindowSynrec_ActorData.prototype.resetTextColor = function () {
    const base = Window_Base.prototype.resetTextColor;
    const custom_config = this._style_data;
    if (!custom_config) return base.call(this);
    const text_color = custom_config['Base Font Color'] || "#ffffff";
    const outline_color = custom_config['Font Outline Color'] || "rgba(0, 0, 0, 0.5)";
    this.changeTextColor(text_color);
    this.contents.outlineColor = outline_color;
}

WindowSynrec_ActorData.prototype.setOpacityAndDimmer = function () {
    const custom_config = this._style_data;
    if (!custom_config) return;
    const show_dimmer = eval(custom_config['Show Window Dimmer']) || false;
    const win_opacity = eval(custom_config['Window Opacity']) || 0;
    this.opacity = win_opacity;
    show_dimmer ? this.showBackgroundDimmer() : this.hideBackgroundDimmer();
}

WindowSynrec_ActorData.prototype.createCharacterSprite = function () {
    const chara = new GameSyn_WindowCharacterStats();
    const sprite = new SpriteSynrec_WindowCharacterStats(chara);
    this.addChild(sprite);
    this._chara = chara;
    this._character_sprite = sprite;
}

WindowSynrec_ActorData.prototype.createBattlerSprite = function () {
    const sprite = new SpriteSynrec_ActorStats();
    this.addChild(sprite);
    this._battler_sprite = sprite;
}

WindowSynrec_ActorData.prototype.setActor = function (actor) {
    if (!actor) return this.hide();
    if (actor.isActor) {
        if (actor.isActor()) {
            this.contents.clear();
            this._actor = actor;
            this.drawData();
            this.show();
            this.updateActor(actor);
            this._autoRefresh = 12;
            return;
        }
    }
    this.hide();
}

WindowSynrec_ActorData.prototype.updateActor = function (actor) {
    const data = this._custom_data;
    if (eval(data['Draw Actor Character'])) {
        if (!this._character_sprite) this.createCharacterSprite();
        const cx = eval(data['Character X']);
        const cy = eval(data['Character Y']);
        const cd = eval(data['Character Direction']);
        this._chara.setActor(actor);
        this._chara.setScreenX(cx);
        this._chara.setScreenY(cy);
        this._chara.setDirection(cd);
    } else if (this._chara) {
        this._chara.setActor(null);
    }
    if (eval(data['Draw Actor Battler'])) {
        if (!this._battler_sprite) this.createBattlerSprite();
        const bx = eval(data['Battler X']);
        const by = eval(data['Battler Y']);
        const bsx = eval(data['Battler Scale X']);
        const bsy = eval(data['Battler Scale Y']);
        const b_mot = data['Battler Motion'];
        this._battler_sprite.setBattler(actor);
        this._battler_sprite.setMotion(b_mot);
        this._battler_sprite.refreshMotion();
        this._battler_sprite.setHome(bx, by);
        this._battler_sprite.scale.x = bsx;
        this._battler_sprite.scale.y = bsy;
    } else if (this._battler_sprite) {
        this._battler_sprite.setBattler(null);
    }
}

WindowSynrec_ActorData.prototype.drawData = function () {
    if (this._custom_data) {
        this.drawActorName();
        this.drawActorPoints();
        this.drawFacePic();
        this.drawProfile();
        this.drawClassLevel();
        this.drawResources();
        this.drawBaseParams();
        this.drawExParams();
        this.drawSpParams();
        this.drawStates();
        this.drawEquips();
    }
}

WindowSynrec_ActorData.prototype.drawActorName = function () {
    const actor = this._actor;
    const data = this._custom_data;
    if (!eval(data['Draw Actor Name'])) return;
    const name = actor.name();
    const nx = eval(data['Name X']);
    const ny = eval(data['Name Y']);
    this.drawTextEx(name, nx, ny);
}

WindowSynrec_ActorData.prototype.drawActorPoints = function () {
    const actor = this._actor;
    const data = this._custom_data;
    if (!eval(data['Draw Actor Points'])) return;
    const rem = actor.availableLevelPoints();
    const max = actor.maxLevelPoints();
    const text = (data['Points Text'] || "").format(rem, max);
    const px = eval(data['Points X']);
    const py = eval(data['Points Y']);
    this.drawTextEx(text, px, py);
}

WindowSynrec_ActorData.prototype.drawFacePic = function () {
    const actor = this._actor;
    const data = this._custom_data;
    if (!eval(data['Draw Actor Face'])) return;
    const face_name = actor.faceName();
    const face_index = actor.faceIndex();
    const fx = eval(data['Face X']);
    const fy = eval(data['Face Y']);
    const fw = eval(data['Face Width']);
    const fh = eval(data['Face Height']);
    this.drawFace(face_name, face_index, fx, fy, fw, fh);
}

WindowSynrec_ActorData.prototype.drawProfile = function () {
    const actor = this._actor;
    const data = this._custom_data;
    if (!eval(data['Draw Actor Profile'])) return;
    const profile = actor.profile();
    const px = eval(data['Profile X']);
    const py = eval(data['Profile Y']);
    this.drawTextEx(profile, px, py);
}

WindowSynrec_ActorData.prototype.drawClassLevel = function () {
    const actor = this._actor;
    const data = this._custom_data;
    if (!eval(data['Draw Actor Class Level'])) return;
    const actor_class = actor.currentClass();
    const class_name = actor_class.name;
    const level = actor._level;
    const text = data['Class Text'].format(class_name, level);
    const cls_x = eval(data['Class X']);
    const cls_y = eval(data['Class Y']);
    this.drawText(text, cls_x, cls_y);
}

WindowSynrec_ActorData.prototype.drawResources = function () {
    this.drawResHP();
    this.drawResMP();
    this.drawResTP();
}

WindowSynrec_ActorData.prototype.drawResHP = function () {
    const actor = this._actor;
    const data = this._custom_data;
    if (!eval(data['Draw HP Resource'])) return;
    const cur_hp = actor.hp;
    const max_hp = actor.param(0);
    const ratio_perc = Math.ceil((cur_hp / max_hp) * 100);
    const text = data['HP Text'].format(cur_hp, max_hp, ratio_perc);
    const tx = eval(data['HP X']);
    const ty = eval(data['HP Y']);
    this.drawTextEx(text, tx, ty);
}

WindowSynrec_ActorData.prototype.drawResMP = function () {
    const actor = this._actor;
    const data = this._custom_data;
    if (!eval(data['Draw MP Resource'])) return;
    const cur_mp = actor.mp;
    const max_mp = actor.param(1);
    const ratio_perc = Math.ceil((cur_mp / max_mp) * 100);
    const text = data['MP Text'].format(cur_mp, max_mp, ratio_perc);
    const tx = eval(data['MP X']);
    const ty = eval(data['MP Y']);
    this.drawTextEx(text, tx, ty);
}

WindowSynrec_ActorData.prototype.drawResTP = function () {
    const actor = this._actor;
    const data = this._custom_data;
    if (!eval(data['Draw TP Resource'])) return;
    const cur_tp = actor.tp;
    const max_tp = actor.maxTp();
    const ratio_perc = Math.ceil((cur_tp / max_tp) * 100);
    const text = data['TP Text'].format(cur_tp, max_tp, ratio_perc);
    const tx = eval(data['TP X']);
    const ty = eval(data['TP Y']);
    this.drawTextEx(text, tx, ty);
}

WindowSynrec_ActorData.prototype.drawBaseParams = function () {
    const window = this;
    const data = this._custom_data;
    const base_params = data['Draw Base Param'];
    base_params.forEach((base_param) => {
        window.drawBaseParam(base_param);
    })
}

WindowSynrec_ActorData.prototype.drawBaseParam = function (base_param) {
    const actor = this._actor;
    const param_id = eval(base_param['Param']);
    const prm_x = eval(base_param['X']) || 0;
    const prm_y = eval(base_param['Y']) || 0;
    const actor_param = actor.param(param_id);
    const text = (base_param['Text'] || "").format(actor_param);
    this.drawTextEx(text, prm_x, prm_y);
}

WindowSynrec_ActorData.prototype.drawExParams = function () {
    const window = this;
    const data = this._custom_data;
    const ex_params = data['Draw Ex Param'];
    ex_params.forEach((ex_param) => {
        window.drawExParam(ex_param);
    })
}

WindowSynrec_ActorData.prototype.drawExParam = function (ex_param) {
    const actor = this._actor;
    const param_id = eval(ex_param['Param']);
    const prm_x = eval(ex_param['X']);
    const prm_y = eval(ex_param['Y']);
    const actor_param = actor.xparam(param_id);
    const text = ex_param['Text'].format(actor_param);
    this.drawTextEx(text, prm_x, prm_y);
}

WindowSynrec_ActorData.prototype.drawSpParams = function () {
    const window = this;
    const data = this._custom_data;
    const sp_params = data['Draw Sp Param'];
    sp_params.forEach((sp_param) => {
        window.drawSpParam(sp_param);
    })
}

WindowSynrec_ActorData.prototype.drawSpParam = function (sp_param) {
    const actor = this._actor;
    const param_id = eval(sp_param['Param']);
    const prm_x = eval(sp_param['X']);
    const prm_y = eval(sp_param['Y']);
    const actor_param = actor.sparam(param_id);
    const text = sp_param['Text'].format(actor_param);
    this.drawTextEx(text, prm_x, prm_y);
}

WindowSynrec_ActorData.prototype.drawStates = function () {
    const actor = this._actor;
    const data = this._custom_data;
    const states = actor.states();
    const max_draw = eval(data['Draw Actor States']);
    const sx = eval(data['State X']);
    const sy = eval(data['State Y']);
    const draw_icon = data['State Icon'];
    const draw_name = data['State Name'];
    if (!draw_icon && !draw_name) return;
    const max = Math.min(states.length, max_draw);
    const max_w = this.contentsWidth();
    const max_h = this.contentsHeight();
    let x = JsonEx.makeDeepCopy(sx);
    let y = JsonEx.makeDeepCopy(sy);
    for (let i = 0; i < max; i++) {
        if (y < (max_h - this.lineHeight())) {
            const state = states[i];
            const icon = state.iconIndex;
            const name = state.name;
            if (draw_icon) {
                this.drawIcon(icon, x, y);
                x += 36;
                if (x > max_w) {
                    x = JsonEx.makeDeepCopy(sx);
                    y += this.lineHeight();
                }
            }
            if (draw_name) {
                this.drawText(name, x, y);
                x = JsonEx.makeDeepCopy(sx);
                y += this.lineHeight();
            }
        }
    }
}

WindowSynrec_ActorData.prototype.drawEquips = function () {
    const window = this;
    const data = this._custom_data;
    const equip_info = data['Draw Equip Slots'];
    equip_info.forEach((eq_data) => {
        window.drawEquip(eq_data);
    })
}

WindowSynrec_ActorData.prototype.drawEquip = function (equip_data) {
    const actor = this._actor;
    const equips = actor.equips();
    const slot_index = eval(equip_data['Slot Index']);
    const equip = equips[slot_index];
    let eq_x = eval(equip_data['X']);
    const eq_y = eval(equip_data['Y']);
    const drw_ico = equip_data['Draw Icon'];
    const drw_nme = equip_data['Draw Name'];
    if (equip) {
        const icon = equip.iconIndex;
        const name = equip.name;
        if (drw_ico) {
            this.drawIcon(icon, eq_x, eq_y);
            eq_x += 36;
        }
        if (drw_nme) {
            this.drawText(name, eq_x, eq_y);
        }
    }
}

WindowSynrec_ActorData.prototype.update = function(){
    Window_Base.prototype.update.call(this, ...arguments);
    this.updateRefresh();
}

WindowSynrec_ActorData.prototype.updateRefresh = function(){
    if(this._autoRefresh > 0){
        this._autoRefresh--;
        if(this._autoRefresh <= 0){
            this.setActor(this._actor);
        }
    }
}

function WindowSynrec_StatSelect() {
    this.initialize(...arguments);
}

WindowSynrec_StatSelect.prototype = Object.create(Window_Selectable.prototype);
WindowSynrec_StatSelect.prototype.constructor = WindowSynrec_StatSelect;

WindowSynrec_StatSelect.prototype.initialize = function () {
    const data = Syn_LvlStats.ALLOCATION_WINDOW_CONFIG;
    const rect = this.createRect(data);
    this._window_data = data;
    this._style_data = data['Window Font and Style Configuration'];
    if (Utils.RPGMAKER_NAME == "MZ") {
        Window_Selectable.prototype.initialize.call(this, rect);
    } else {
        const x = rect.x;
        const y = rect.y;
        const w = rect.width;
        const h = rect.height;
        Window_Selectable.prototype.initialize.call(this, x, y, w, h);
    }
    this.setOpacityAndDimmer();
}

WindowSynrec_StatSelect.prototype.createRect = function (data) {
    const dimension_config = data['Dimension Configuration'];
    const x = eval(dimension_config['X']);
    const y = eval(dimension_config['Y']);
    const w = eval(dimension_config['Width']);
    const h = eval(dimension_config['Height']);
    return new Rectangle(x, y, w, h);
}

WindowSynrec_StatSelect.prototype.standardPadding = function () {
    return 8;
}

WindowSynrec_StatSelect.prototype.loadWindowskin = function () {
    const base = Window_Selectable.prototype.loadWindowskin.call(this);
    const custom_config = this._style_data;
    if (!custom_config) return base;
    const skin_name = custom_config['Window Skin'];
    if (!skin_name) return base;
    this.windowskin = ImageManager.loadSystem(skin_name);
}

WindowSynrec_StatSelect.prototype.resetFontSettings = function () {
    const base = Window_Selectable.prototype.resetFontSettings;
    const custom_config = this._style_data;
    if (!custom_config) return base.call(this);
    const font_face = custom_config['Font Face'] || "sans-serif";
    const font_size = eval(custom_config['Font Size']) || 16;
    const font_outline_size = eval(custom_config['Font Outline Thickness']) || 3;
    this.contents.fontFace = font_face;
    this.contents.fontSize = font_size;
    this.contents.outlineWidth = font_outline_size;
    this.resetTextColor();
}

WindowSynrec_StatSelect.prototype.resetTextColor = function () {
    const base = Window_Selectable.prototype.resetTextColor;
    const custom_config = this._style_data;
    if (!custom_config) return base.call(this);
    const text_color = custom_config['Base Font Color'] || "#ffffff";
    const outline_color = custom_config['Font Outline Color'] || "rgba(0, 0, 0, 0.5)";
    this.changeTextColor(text_color);
    this.contents.outlineColor = outline_color;
}

WindowSynrec_StatSelect.prototype.setOpacityAndDimmer = function () {
    const custom_config = this._style_data;
    if (!custom_config) return;
    const show_dimmer = eval(custom_config['Show Window Dimmer']) || false;
    const win_opacity = eval(custom_config['Window Opacity']) || 0;
    this.opacity = win_opacity;
    show_dimmer ? this.showBackgroundDimmer() : this.hideBackgroundDimmer();
}

WindowSynrec_StatSelect.prototype.itemWidth = function () {
    const data = this._window_data;
    return data ? eval(data['Item Width']) || 0 : Window_Selectable.prototype.itemWidth.call(this);
}

WindowSynrec_StatSelect.prototype.itemHeight = function () {
    const data = this._window_data;
    return data ? eval(data['Item Height']) || 0 : Window_Selectable.prototype.itemHeight.call(this) + 8;
}

WindowSynrec_StatSelect.prototype.maxCols = function () {
    const data = this._window_data;
    return eval(data['Vertical Mode']) ? 1 : 8;
}

WindowSynrec_StatSelect.prototype.maxItems = function () {
    return 8;
}

WindowSynrec_StatSelect.prototype.drawItem = function (index) {
    const actor = $gameParty.menuActor();
    const rect = this.itemRect(index);
    this.drawStatImage(index, rect);
    this.drawAllocatedPoints(index, actor, rect);
}

WindowSynrec_StatSelect.prototype.getImgData = function(index){
    switch(index){
        case 0: return Syn_LvlStats.HP_IMG_STAT;
        case 1: return Syn_LvlStats.MP_IMG_STAT;
        case 2: return Syn_LvlStats.ATK_IMG_STAT;
        case 3: return Syn_LvlStats.DEF_IMG_STAT;
        case 4: return Syn_LvlStats.MAT_IMG_STAT;
        case 5: return Syn_LvlStats.MDF_IMG_STAT;
        case 6: return Syn_LvlStats.AGI_IMG_STAT;
        case 7: return Syn_LvlStats.LUK_IMG_STAT;
    }
    return null;
}

WindowSynrec_StatSelect.prototype.drawStatImage = function(index, rect){
    const rx = rect.x;
    const ry = rect.y;
    const rw = rect.width;
    const rh = rect.height;
    const img_data = this.getImgData(index);
    if(!img_data)return;
    const pic_name = img_data['Picture'];
    if(!pic_name)return;
    const bitmap = ImageManager.loadPicture(pic_name);
    const bx = 0;
    const by = 0;
    const bw = bitmap.width;
    const bh = bitmap.height;
    const dx = rx + eval(img_data['Offset X']);
    const dy = ry + eval(img_data['Offset Y']);
    const dw = eval(img_data['Draw Width']);
    const dh = eval(img_data['Draw Height']);
    this.contents.blt(bitmap,bx,by,bw,bh,dx,dy,dw,dh);
    this._autoRefresh = !bw || !bh;
}

WindowSynrec_StatSelect.prototype.drawAllocatedPoints = function(index, actor, rect){
    const rx = rect.x;
    const ry = rect.y;
    const rw = rect.width;
    const rh = rect.height;
    const allocated_points = actor.allocatedLevelPoints(index);
    const level_stats = actor.levelBaseParam(index);
    const text = (this._window_data['Points Text'] || "").format(allocated_points, level_stats);
    const tx = rx + eval(this._window_data['Points Text Offset X']);
    const ty = ry + eval(this._window_data['Points Text Offset Y']);
    this.drawTextEx(text, tx, ty);
}

WindowSynrec_StatSelect.prototype.update = function(){
    Window_Selectable.prototype.update.call(this, ...arguments);
    this.updateRefresh();
}

WindowSynrec_StatSelect.prototype.updateRefresh = function(){
    if(this._autoRefresh){
        this.refresh();
    }
}

function SpriteSynrec_WindowCharacterStats() {
    this.initialize(...arguments);
}

SpriteSynrec_WindowCharacterStats.prototype = Object.create(Sprite_Character.prototype);
SpriteSynrec_WindowCharacterStats.prototype.constructor = SpriteSynrec_WindowCharacterStats;

SpriteSynrec_WindowCharacterStats.prototype.update = function () {
    this.updateChara();
    if (this._character) {
        const char_name = this._character._characterName;
        if (char_name) Sprite_Character.prototype.update.call(this);
    }
}

SpriteSynrec_WindowCharacterStats.prototype.updateChara = function () {
    if (this._character) {
        if (this._character.update) {
            this._character.update();
        }
    }
}

SpriteSynrec_WindowCharacterStats.prototype.updateHpBar = function () { }

SpriteSynrec_WindowCharacterStats.prototype.updateDamageSprites = function () { }

function SpriteSynrec_ActorStats() {
    this.initialize(...arguments);
}

SpriteSynrec_ActorStats.prototype = Object.create(Sprite_Actor.prototype);
SpriteSynrec_ActorStats.prototype.constructor = SpriteSynrec_ActorStats;

SpriteSynrec_ActorStats.prototype.updateMain = function () {
    this.updateBitmap();
    this.updateFrame();
    this.updateMove();
    this.updatePosition();
}

SpriteSynrec_ActorStats.prototype.updateVisibility = function () {
    const isMV = Utils.RPGMAKER_NAME == 'MV';
    if (isMV) {
        Sprite_Base.prototype.updateVisibility.call(this);
    } else {
        Sprite_Clickable.prototype.updateVisibility.call(this);
    }
    if (!this._battler) {
        this.visible = false;
    }
}

SpriteSynrec_ActorStats.prototype.moveToStartPosition = function () {
    //No do move.
}

SpriteSynrec_ActorStats.prototype.setActorHome = function (index) {
    //No do this.
}

SpriteSynrec_ActorStats.prototype.setMotion = function (motion_name) {
    this._setMotion = motion_name;
}

SpriteSynrec_ActorStats.prototype.refreshMotion = function () {
    if (!this._setMotion) this._setMotion = 'walk';
    this.startMotion(this._setMotion);
}

function SceneSynrec_StatAllocation(){
    this.initialize(...arguments)
}

SceneSynrec_StatAllocation.prototype = Object.create(Scene_Base.prototype);
SceneSynrec_StatAllocation.prototype.constructor = SceneSynrec_StatAllocation;

SceneSynrec_StatAllocation.prototype.create = function(){
    Scene_Base.prototype.create.call(this, ...arguments);
    this.createWindowLayer();
    this.createAllWindows();
}

SceneSynrec_StatAllocation.prototype.createAllWindows = function(){
    this.createDataWindows();
    this.createAllocationWindow();
    this.refreshDataWindows();
}

SceneSynrec_StatAllocation.prototype.createDataWindows = function(){
    if(!Array.isArray(Syn_LvlStats.DATA_WINDOWS)){
        this._data_windows = [];
        return;
    }
    const scene = this;
    const configs = JsonEx.makeDeepCopy(Syn_LvlStats.DATA_WINDOWS);
    const windows = [];
    configs.forEach((config)=>{
        const window = new WindowSynrec_ActorData(config);
        scene.addWindow(window);
        windows.push(window);
    })
    this._data_windows = windows;
}

SceneSynrec_StatAllocation.prototype.createAllocationWindow = function(){
    if(!Syn_LvlStats.ALLOCATION_WINDOW_CONFIG){
        throw new Error(`You need to setup the allocation window in the plugin parameters.`);
    }
    const window = new WindowSynrec_StatSelect();
    window.setHandler('ok', this.allocatePoint.bind(this));
    window.setHandler('cancel', this.popScene.bind(this));
    this.addWindow(window);
    window.activate();
    window.select(0);
    this._allocation_window = window;
}

SceneSynrec_StatAllocation.prototype.allocatePoint = function(){
    const param_id = this._allocation_window.index();
    if(param_id < 0 || isNaN(param_id)){
        SoundManager.playBuzzer();
        this._allocation_window.select(0);
        this._allocation_window.activate();
        return;
    }
    const actor = $gameParty.menuActor();
    if(actor.boostLevelStats(1, param_id)){
        SoundManager.playEquip();
    }else{
        SoundManager.playBuzzer();
    }
    this._allocation_window.activate();
    this.refreshDataWindows();
}

SceneSynrec_StatAllocation.prototype.update = function(){
    Scene_Base.prototype.update.call(this);
    this.updateMenuActor();
}

SceneSynrec_StatAllocation.prototype.updateMenuActor = function(){
    if(Input.isTriggered('pageup')){
        $gameParty.makeMenuActorPrevious();
        this.refreshDataWindows();
    }
    if(Input.isTriggered('pagedown')){
        $gameParty.makeMenuActorNext();
        this.refreshDataWindows();
    }
}

SceneSynrec_StatAllocation.prototype.refreshDataWindows = function(){
    const actor = $gameParty.menuActor();
    this._data_windows.forEach((window)=>{
        window.setActor(actor);
    })
    this._allocation_window.refresh();
}