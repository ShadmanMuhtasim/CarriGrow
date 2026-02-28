<?php

namespace App\Support;

class Constants
{
    public const USER_ROLES = ['job_seeker','employer','mentor','admin'];

    public const USER_STATUS = ['active','banned'];

    public const JOB_STATUS = ['open','closed'];
    public const JOB_TYPES  = ['full_time','part_time','intern','remote'];

    public const APPLICATION_STATUS = ['applied','reviewed','shortlisted','rejected'];

    public const FORUM_POST_STATUS = ['active','hidden','deleted'];
}