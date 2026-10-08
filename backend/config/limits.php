<?php

return [
    'auth_per_minute' => (int) env('AUTH_RATE_LIMIT', 10),
    'api_per_minute' => (int) env('API_RATE_LIMIT', 600),
];
