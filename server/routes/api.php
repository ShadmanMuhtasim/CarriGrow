<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ForumPostController;
use App\Http\Controllers\ForumReplyController;
use App\Http\Controllers\JobBrowseController;
use App\Http\Controllers\JobApplicationController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\JobRecommendationController;
use App\Http\Controllers\JobSkillController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SkillMatchController;
use App\Http\Controllers\SessionController;
use App\Http\Controllers\SkillController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/skills', [SkillController::class, 'index']);
Route::get('/jobs', [JobBrowseController::class, 'index']);
Route::get('/jobs/featured', [JobBrowseController::class, 'featured']);
Route::get('/jobs/{job}', [JobBrowseController::class, 'show']);
Route::get('/jobs/{job}/skills', [JobSkillController::class, 'index']);
Route::get('/forum/posts', [ForumPostController::class, 'index']);
Route::get('/forum/posts/{post}', [ForumPostController::class, 'show']);

// ---- JWT Auth routes ----
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:login');
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:login');
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);
Route::post('/auth/logout', [AuthController::class, 'logout']);

Route::middleware('auth:api')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/stream', [NotificationController::class, 'stream']);
    Route::put('/notifications/read-all', [NotificationController::class, 'readAll']);
    Route::put('/notifications/{notification}/read', [NotificationController::class, 'read']);

    Route::get('/users/me', [UserController::class, 'me']);
    Route::put('/users/me', [UserController::class, 'updateMe']);
    Route::delete('/users/me/profile', [UserController::class, 'deleteMyProfile']);
    Route::post('/users/me/skills', [UserController::class, 'setMySkills']);

    Route::get('/users/{user}/skills', [SkillController::class, 'userSkills']);
    Route::post('/users/{user}/skills', [SkillController::class, 'attachUserSkill']);
    Route::delete('/users/{user}/skills/{skill}', [SkillController::class, 'detachUserSkill']);

    Route::prefix('/employer/jobs')->group(function () {
        Route::get('/', [JobController::class, 'index']);
        Route::post('/', [JobController::class, 'store']);
        Route::get('/{job}', [JobController::class, 'show']);
        Route::match(['put', 'patch'], '/{job}', [JobController::class, 'update']);
        Route::delete('/{job}', [JobController::class, 'destroy']);
    });

    Route::post('/jobs/{job}/apply', [JobApplicationController::class, 'apply']);
    Route::post('/jobs/{job}/skills', [JobSkillController::class, 'store']);
    Route::get('/jobs/{job}/match-score', [SkillMatchController::class, 'matchScore']);
    Route::get('/recommendations/jobs', [JobRecommendationController::class, 'index']);
    Route::get('/users/{user}/recommended-jobs', [SkillMatchController::class, 'recommendedJobs']);
    Route::get('/applications', [JobApplicationController::class, 'indexForJobSeeker']);
    Route::get('/jobs/{job}/applications', [JobApplicationController::class, 'indexForEmployer']);
    Route::post('/forum/posts', [ForumPostController::class, 'store']);
    Route::match(['put', 'patch'], '/forum/posts/{post}', [ForumPostController::class, 'update']);
    Route::delete('/forum/posts/{post}', [ForumPostController::class, 'destroy']);
    Route::post('/forum/posts/{post}/replies', [ForumReplyController::class, 'store']);
    Route::match(['put', 'patch'], '/forum/replies/{reply}', [ForumReplyController::class, 'update']);
    Route::delete('/forum/replies/{reply}', [ForumReplyController::class, 'destroy']);
    Route::post('/forum/replies/{reply}/mark-solution', [ForumReplyController::class, 'markSolution']);
});

// ---- (Optional) old template routes ----
// If you keep these, protect them properly later.
Route::prefix('/legacy')->group(function () {
    Route::get('/session', [SessionController::class, 'getSession']);
    Route::post('/session', [SessionController::class, 'createSession'])->middleware('check.admin');
    Route::put('/session', [SessionController::class, 'updateSession'])->middleware('check.admin');
    Route::post('/sessions', [SessionController::class, 'viewSessions'])->middleware('check.admin');
    Route::post('/attendance', [SessionController::class, 'submitAttendance']);
});


