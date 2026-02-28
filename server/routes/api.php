<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\SessionController;

use App\Http\Controllers\SkillController;
use App\Http\Controllers\UserController;

Route::get('/skills', [SkillController::class, 'index']);

Route::middleware('auth:api')->group(function () {
    Route::get('/users/me', [UserController::class, 'me']);
    Route::put('/users/me', [UserController::class, 'updateMe']);
    Route::post('/users/me/skills', [UserController::class, 'setMySkills']);
});


// ---- JWT Auth routes ----
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:api')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
});

// ---- (Optional) old template routes ----
// If you keep these, protect them properly later.
Route::get('/session', [SessionController::class, 'getSession']);
Route::post('/session', [SessionController::class, 'createSession'])->middleware('check.admin');
Route::put('/session', [SessionController::class, 'updateSession'])->middleware('check.admin');
Route::post('/sessions', [SessionController::class, 'viewSessions'])->middleware('check.admin');
Route::post('/attendance', [SessionController::class, 'submitAttendance']);